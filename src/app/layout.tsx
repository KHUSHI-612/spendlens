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
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
          <div className="max-w-full mx-auto px-6 h-24 flex items-center relative">
            {/* Logo Left */}
            <div className="flex items-center gap-3 ml-4 sm:ml-8">
              <div className="w-9 h-9 bg-electric-500 rounded-lg flex items-center justify-center font-black text-white italic shadow-[0_0_20px_rgba(59,130,246,0.4)]">S</div>
              <span className="text-2xl tracking-tighter text-white">
                <span className="font-black">Spend</span>
                <span className="font-light opacity-70">Lens</span>
              </span>
            </div>
            
            {/* Centered Navigation */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12">
              <a href="#" className="text-base font-semibold text-white hover:text-electric-400 transition-colors">
                Home
              </a>
              <a href="#features" className="text-base font-semibold text-white hover:text-electric-400 transition-colors">
                Features
              </a>
              <a href="#audit-form" className="text-base font-semibold text-white hover:text-electric-400 transition-colors">
                Audits
              </a>
            </div>
          </div>
        </nav>

        <main className="pt-24 relative z-0 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
