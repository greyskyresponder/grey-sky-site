export const BRAND = {
  name: "Grey Sky Responder Society",
  shortName: "Grey Sky",
  tagline: "Your Service. Your Story. Recognized.",
  owner: "Longview Solutions Group LLC",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://greysky.dev",
} as const;

export const COLORS = {
  commandNavy: "#0A1628",
  signalGold: "#C5933A",
  slate: "#1A2A44",
  steel: "#6B7B8F",
  silver: "#A0AEC0",
  cloud: "#E2E8F0",
  white: "#FFFFFF",
  alert: "#E53E3E",
  success: "#38A169",
} as const;

export const STATUS_BADGE_COLORS = {
  active: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
  expired: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
  inactive: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  verified: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
} as const;

export const FONT = {
  family: "Inter",
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
} as const;
