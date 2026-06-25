import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Programming",
  description:
    "Adaptive CrossFit + wellness programming — show up, hit START, the screen takes over.",
  applicationName: "Open Programming",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Open Programming",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  // The runner is a full-screen, fixed-layout surface; prevent zoom jank mid-WOD.
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
