import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AsciiArrt | Terminal Image Converter",
  description: "Algorithmic image digestion layer. Convert visual data to raw character matrices. No pixels, just syntax.",
  metadataBase: new URL("https://asciiarrt.sukhjitsingh.me"),
  openGraph:{
    title: "AsciiArrt | Terminal Image Converter",
    description: "Algorithmic image digestion layer. Convert visual data to raw character matrices. No pixels, just syntax.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AsciiArrt | Terminal Image Converter",
      },
    ],
    
  },
  twitter:{
    title: "AsciiArrt | Terminal Image Converter",
    description: "Algorithmic image digestion layer. Convert visual data to raw character matrices. No pixels, just syntax.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AsciiArrt | Terminal Image Converter",
      },
    ],
    card: "summary_large_image",
    creator: "@thesukhjitbajwa",
    creatorId: "thesukhjitbajwa",
  },
  creator:"Sukhjit Singh Bajwa"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
