import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://googlesql.com"),
  title: {
    default: "GoogleSQL Copilot - AI Data Analyst for BigQuery",
    template: "%s | GoogleSQL"
  },
  description:
    "Generate, explain, and optimize GoogleSQL for BigQuery with an AI Data Analyst workflow.",
  openGraph: {
    title: "GoogleSQL Copilot",
    description: "Your AI Data Analyst for BigQuery.",
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

