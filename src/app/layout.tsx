import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Finance Tracker",
  description: "Track monthly income and expenses migrated from Excel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
