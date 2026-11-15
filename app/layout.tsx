import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Noto_Serif({ variable: "--font-serif", subsets: ["latin"], weight: ["400"] });

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
      className={`${sans.variable} ${serif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
