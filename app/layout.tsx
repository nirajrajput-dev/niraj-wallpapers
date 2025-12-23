import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#FDFDFD",
              border: "1px solid #333",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#FDFDFD",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#FDFDFD",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
