// TODO: Tests needed — unauthenticated redirect, role-based access, auth page redirect,
// security headers, CORS rejection, rate limit exceeded, MFA enforcement.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { rateLimiter, RATE_LIMITS, buildKey } from "@/lib/security/rate-limiter";

// NOTE: Do NOT import `env` from "@/lib/env" here.
// The Zod env module eagerly validates ALL server vars (Stripe keys, etc.)
// at module load time. Middleware runs in the Edge/Node cold-start path and
// Azure SWA's warm-up probe hits it before env vars are fully injected,
// causing the 585s warm-up timeout. Middleware only needs the two public
// Supabase vars, so we read them directly from process.env.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const AUTH_RATE_LIMITS: Record<string, keyof typeof RATE_LIMITS> = {
  "/login": "auth/login",
  "/register": "auth/register",
  "/reset-password": "auth/reset",
};

const MFA_SENSITIVE_PREFIXES = ["/admin"];

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function getAllowedOrigins(): string[] {
  return [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERIFICATION_URL,
  ].filter((o): o is string => Boolean(o));
}

function rejectCors(): NextResponse {
  const response = new NextResponse("Forbidden", { status: 403 });
  applySecurityHeaders(response.headers);
  return response;
}

function rateLimitExceeded(retryAfter: number): NextResponse {
  const response = NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 },
  );
  response.headers.set("Retry-After", String(retryAfter));
  applySecurityHeaders(response.headers);
  return response;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // ── 1. CORS validation (API routes) ────────────────────
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    if (origin) {
      const allowed = getAllowedOrigins();
      if (allowed.length > 0 && !allowed.includes(origin)) {
        return rejectCors();
      }
    }
  }

  // ── 2. Rate limiting (auth + API) ──────────────────────
  const ip = getClientIp(request);

  const authScope = AUTH_RATE_LIMITS[pathname];
  if (authScope && method === "POST") {
    const key = buildKey(authScope, ip);
    const check = rateLimiter.check(key, RATE_LIMITS[authScope]);
    if (!check.allowed) return rateLimitExceeded(check.retryAfter ?? 60);
  }

  if (pathname.startsWith("/api/")) {
    const key = buildKey("api/default", ip);
    const check = rateLimiter.check(key, RATE_LIMITS["api/default"]);
    if (!check.allowed) return rateLimitExceeded(check.retryAfter ?? 60);
  }

  // ── 3. Supabase session refresh ────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPrefixes = ["/dashboard", "/agency", "/admin"];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // ── 4. Redirect unauthenticated users from protected routes ──
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    applySecurityHeaders(redirect.headers);
    return redirect;
  }

  // ── 5. Role-based enforcement ──────────────────────────
  if (user) {
    const needsRoleCheck =
      pathname.startsWith("/admin") || pathname.startsWith("/agency");

    if (needsRoleCheck) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role ?? "member";

      if (pathname.startsWith("/admin") && role !== "platform_admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.searchParams.set("error", "insufficient_permissions");
        const redirect = NextResponse.redirect(url);
        applySecurityHeaders(redirect.headers);
        return redirect;
      }

      if (
        pathname.startsWith("/agency") &&
        role !== "org_admin" &&
        role !== "platform_admin"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.searchParams.set("error", "insufficient_permissions");
        const redirect = NextResponse.redirect(url);
        applySecurityHeaders(redirect.headers);
        return redirect;
      }
    }
  }

  // ── 6. MFA challenge for sensitive routes ──────────────
  if (
    user &&
    MFA_SENSITIVE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    // Only block when MFA is enrolled (nextLevel === 'aal2') but the current
    // session has not cleared the challenge yet.
    if (
      aal &&
      aal.nextLevel === "aal2" &&
      aal.currentLevel !== "aal2"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("mfa", "required");
      const redirect = NextResponse.redirect(url);
      applySecurityHeaders(redirect.headers);
      return redirect;
    }
  }

  // ── 7. Redirect authenticated users away from auth pages ──
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirect = NextResponse.redirect(url);
    applySecurityHeaders(redirect.headers);
    return redirect;
  }

  // ── 8. Apply security headers to the final response ────
  applySecurityHeaders(supabaseResponse.headers);

  return supabaseResponse;
}
