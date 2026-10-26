/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./globals.css";
import "aos/dist/aos.css";
import localFont from "next/font/local";
import { Kantumruy_Pro, Newsreader } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./provider/authProvider";
import AosInitializer from "@/components/AosInitializer";

const geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
});

const khmerFont = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  variable: "--font-khmer",
  display: "swap",
});

const headingFont = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  adjustFontFallback: false,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://frontend-eta-woad-54.vercel.app"),
  title: "MOHAORI — Fashion and Everyday Essentials",
  description:
    "Discover clothing, footwear, accessories, and everyday essentials at MOHAORI.",

  openGraph: {
    url: "https://frontend-eta-woad-54.vercel.app/",
    type: "website",
    siteName: "MOHAORI",
    title: "MOHAORI — Fashion and Everyday Essentials",
    description:
      "Discover clothing, footwear, accessories, and everyday essentials at MOHAORI.",
    images: [
      {
        url: "/page.png",
        width: 1200,
        height: 630,
        alt: "MOHAORI collection",
      },
    ],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable, khmerFont.variable, headingFont.variable)}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <AosInitializer />
              <div className="flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
              </div>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
