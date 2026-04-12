import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
