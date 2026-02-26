import type { Metadata } from "next";
import Provider from "@/components/ui/provider";
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
