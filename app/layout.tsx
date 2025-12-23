import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niraj Wallpapers",
  description:
    "Explore stunning wallpapers, grouped by their titles for easy browsing.",
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
