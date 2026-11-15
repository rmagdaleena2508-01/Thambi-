import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Tamil, Noto_Serif, Noto_Serif_Tamil } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans({ variable: "--font-sans", subsets: ["latin"] });
const tamil = Noto_Sans_Tamil({ variable: "--font-tamil", subsets: ["tamil"] });
const serif = Noto_Serif({ variable: "--font-serif", subsets: ["latin"], weight: ["400"] });
const serifTamil = Noto_Serif_Tamil({ variable: "--font-serif-tamil", subsets: ["tamil"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Thambi — Tell Thambi. It gets taken care of.",
  description:
    "Report broken roads, water leaks, sewage and pollution in Tamil Nadu. Thambi rates how serious it is, joins neighbours' reports, and tracks it in public until it is fixed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${tamil.variable} ${serif.variable} ${serifTamil.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
