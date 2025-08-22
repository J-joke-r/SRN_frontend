import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from './providers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SRN Project",
  description: "Community Data Platform",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {/* Top-center emblem across all pages */}
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <img
            src="/shankchakranama.png"
            alt="Emblem"
            className="w-[200px] h-auto"
          />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

