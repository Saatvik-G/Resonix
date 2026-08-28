import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import SplashScreen from "@/components/ui/SplashScreen";

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

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0a0d",
};

export const metadata: Metadata = {
  title: "Resonix — Global Music Discovery Engine",
  description: "Discover music across all eras & global languages (Punjabi, Hindi, English, Spanish, K-Pop). AI & human curator insights with outbound listen links.",
  keywords: ["music discovery", "Punjabi music", "Bollywood music", "AI music curator", "mood music", "playlist generator"],
  openGraph: {
    title: "Resonix — Global Music Discovery Engine",
    description: "Discover songs across all genres, decades, and languages.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${playfair.variable} max-w-full overflow-x-hidden`}>
      <body className="bg-warm-mesh min-h-screen text-zinc-100 font-sans antialiased relative max-w-full overflow-x-hidden selection:bg-amber-500/30 selection:text-white">
        <SplashScreen />
        <AnimatedBackground />
        <div className="relative z-10 max-w-full overflow-x-hidden flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
