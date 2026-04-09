import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Operator";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Grey Sky Responder Portal — Credential management and deployment readiness
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#C5933A]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#C5933A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Credentials</p>
              <p className="text-xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Documents</p>
              <p className="text-xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ready Status</p>
              <p className="text-xl font-semibold text-gray-900">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Getting Started
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded bg-gray-50">
            <div className="w-6 h-6 rounded-full bg-[#C5933A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Complete your responder profile
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Add your qualifications, certifications, and agency affiliation
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded bg-gray-50">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Select your discipline requirement packs
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose from USAR, HazMat, SWIFTWATER, and other FEMA NQS disciplines
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded bg-gray-50">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Upload evidence documents
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Submit training records, certifications, and equipment manifests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Account Details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">User ID</dt>
            <dd className="font-mono text-xs text-gray-600">{user?.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd className="font-medium text-gray-900">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Last Sign In</dt>
            <dd className="font-medium text-gray-900">
              {user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
