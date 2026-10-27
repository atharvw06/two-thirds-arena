import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Two-Thirds Arena — Live Game Theory Presentation",
  description:
    "A live classroom game theory experiment: guess two-thirds of the class average, then a Split-or-Steal finale for the prize. Students join from phones; the host runs the show from the projector.",
  keywords: ["game theory", "beauty contest", "nash equilibrium", "classroom game", "two thirds average", "split or steal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-zinc-950 text-zinc-100 font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
