import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans({ variable: "--font-sans", subsets: ["latin"] });
const tamil = Noto_Sans_Tamil({ variable: "--font-tamil", subsets: ["tamil"] });

export const metadata: Metadata = {
  title: "Thambi — Tell Thambi. It gets taken care of.",
  description:
    "Report broken roads, water leaks, sewage and pollution in Tamil Nadu. Thambi rates how serious it is, joins neighbours' reports, and tracks it in public until it is fixed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${tamil.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
