import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grey Sky Responder Society | Disaster Response Credentialing",
  description:
    "Credential, train, and deploy with the premier professional society for disaster response specialists. Built on FEMA NQS standards.",
  keywords: [
    "disaster response",
    "emergency management",
    "credentialing",
    "FEMA NQS",
    "specialized response teams",
    "IMT",
    "US&R",
    "hazmat",
    "first responder",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
