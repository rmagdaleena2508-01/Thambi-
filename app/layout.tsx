import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// One typeface for the whole site: Geist, the family used on Stick It Up.
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thambi: Tell Thambi. It gets taken care of.",
  description:
    "Report a broken road, a water leak or sewage in Tamil Nadu. Thambi reads how serious it is, joins your neighbours' reports, and keeps it public until it is fixed.",
  openGraph: {
    title: "Thambi: Tell Thambi. It gets taken care of.",
    description: "Report civic problems in Tamil Nadu. Keep them public until they are fixed.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
