import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/features/Navbar";
import { Footer } from "@/components/features/Footer";
import { BootScreen } from "@/components/features/BootScreen";
import { SystemLogs } from "@/components/features/SystemLogs";
import { getUserWithRole } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS_OS // DEVDAY_2026",
  description: "FAST NUCES Developer's Day 2026 System Interface",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await getUserWithRole();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
        <BootScreen />
        <SystemLogs role={profile?.role} />
        <Navbar user={user} />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
