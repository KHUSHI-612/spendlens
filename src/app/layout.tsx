import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
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
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased noise-bg grid-bg`}
      >
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2.5" aria-label="SpendLens Home">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <span className="text-lg font-display font-bold text-white tracking-tight">
                  Spend<span className="gradient-text-blue">Lens</span>
                </span>
              </a>
            </div>
          </div>
        </nav>

        <main className="pt-16 relative z-10 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
