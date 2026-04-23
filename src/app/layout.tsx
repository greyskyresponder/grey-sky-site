import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grey Sky Responder Society | Your Service. Your Story. Recognized.",
  description:
    "Professional development and credentialing for the disaster response workforce. Built on FEMA RTLT standards. Document, verify, and own your professional identity.",
  keywords: [
    "disaster response",
    "emergency management",
    "credentialing",
    "FEMA RTLT",
    "FEMA NQS",
    "professional development",
    "specialized response teams",
    "IMT",
    "US&R",
    "hazmat",
    "first responder",
    "disaster credentialing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${sourceSans.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
