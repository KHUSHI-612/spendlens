import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
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
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
          <div className="max-w-full mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative">
            {/* Logo Left */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-electric-500 rounded-lg flex items-center justify-center font-black text-white italic shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-105 transition-transform">S</div>
              <span className="text-xl sm:text-2xl tracking-tighter text-white">
                <span className="font-black">Spend</span>
                <span className="font-light opacity-70">Lens</span>
              </span>
            </Link>
            
            {/* Navigation Links - Hidden on very small screens, shown as centered on md+ */}
            <div className="hidden sm:flex items-center gap-6 md:gap-12 md:absolute md:left-1/2 md:-translate-x-1/2">
              <Link href="/" className="text-sm sm:text-base font-semibold text-white hover:text-electric-400 transition-colors">
                Home
              </Link>
              <Link href="/#features" className="text-sm sm:text-base font-semibold text-white hover:text-electric-400 transition-colors">
                Features
              </Link>
              <Link href="/#audit-form" className="text-sm sm:text-base font-semibold text-white hover:text-electric-400 transition-colors">
                Audits
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-24 relative z-0 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
