import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Two-Thirds Arena — Live Game Theory Game Show",
  description:
    "A live classroom game theory experiment: guess two-thirds of the class average across three rounds, then a Split-or-Steal finale for the prize. Students join from phones; the host runs the show from the projector.",
  keywords: ["game theory", "beauty contest", "nash equilibrium", "classroom game", "two thirds average", "split or steal"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Two-Thirds Arena",
    description: "Guess two-thirds of the average. Outsmart the class. Split or steal the prize.",
    siteName: "Two-Thirds Arena",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
