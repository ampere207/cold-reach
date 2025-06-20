import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ColdReach – AI Cold Outreach Tool",
  description: "Send cold emails that actually get replies with ColdReach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`
            ${geistSans.variable} ${geistMono.variable} antialiased
            bg-gradient-to-br from-white via-[#B8FFF2] to-[#A0E7E5]
            min-h-screen text-[#1E293B]
            relative overflow-x-hidden
          `}
        >
          {/* Optional floating background elements (can be global) */}
          <div className="absolute w-96 h-96 bg-[#E3DFFF] rounded-full blur-3xl opacity-30 -top-20 -left-20 pointer-events-none z-0"></div>
          <div className="absolute w-72 h-72 bg-[#A0E7E5] rounded-full blur-2xl opacity-20 bottom-0 right-0 pointer-events-none z-0"></div>

          <main className="relative z-10">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
