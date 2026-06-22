import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://googlesql.com"),
  title: {
    default: "GoogleSQL - Multilingual SQL Workflow for BigQuery Teams",
    template: "%s | GoogleSQL"
  },
  description:
    "Generate, validate, and govern GoogleSQL with schema-aware SQL, BigQuery dry-runs, admin review, and multilingual learning flows.",
  openGraph: {
    title: "GoogleSQL",
    description:
      "A multilingual GoogleSQL workflow for generation, validation, governance, and learning.",
    url: "https://googlesql.com",
    siteName: "GoogleSQL",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
