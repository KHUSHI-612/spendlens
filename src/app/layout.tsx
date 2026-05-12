import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "700", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "SpendLens — AI Tool Spending Audit for Startups",
  description:
    "Free audit that analyzes your team's AI tool spending and finds savings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-black text-white antialiased selection:bg-electric-500/30`}>
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-white/10" role="navigation" aria-label="Main Navigation">
          <div className="w-full px-4 sm:px-8 h-20 flex items-center justify-between relative">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group" aria-label="SpendLens Home">
              <div className="w-8 h-8 bg-electric-500 rounded-lg flex items-center justify-center font-black text-white group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                S
              </div>
              <span className="text-xl font-display font-black tracking-tighter text-white">
                Spend<span className="text-electric-500">Lens</span>
              </span>
            </Link>

            {/* Navigation Links - Centered in middle */}
            <div className="hidden sm:flex items-center gap-6 md:gap-10 md:absolute md:left-1/2 md:-translate-x-1/2">
              <Link href="/" className="text-sm sm:text-base font-semibold text-gray-200 hover:text-white transition-colors" aria-label="Go to Home">
                Home
              </Link>
              <Link href="/#features" className="text-sm sm:text-base font-semibold text-gray-200 hover:text-white transition-colors" aria-label="View Features">
                Features
              </Link>
              <Link href="/#audit-form" className="text-sm sm:text-base font-semibold text-gray-200 hover:text-white transition-colors" aria-label="Start Audit">
                Audits
              </Link>
            </div>
          </div>
        </nav>

        <main id="main-content" className="pt-20 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
