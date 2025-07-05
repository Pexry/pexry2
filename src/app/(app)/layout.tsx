import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

// Optimize font loading
const dmSans = DM_Sans ({
  subsets: ["latin"],
  display: 'swap', // Improve font loading performance
  preload: true,
});

export const metadata: Metadata = {
  title: "Nawazel - Digital Marketplace",
  description: "Buy and sell digital products on Nawazel marketplace",
  keywords: "digital products, marketplace, buy, sell, online",
  authors: [{ name: "Nawazel Team" }],
  creator: "Nawazel",
  publisher: "Nawazel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes here when available
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Nawazel',
    title: 'Nawazel - Digital Marketplace',
    description: 'Buy and sell digital products on Nawazel marketplace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nawazel - Digital Marketplace',
    description: 'Buy and sell digital products on Nawazel marketplace',
    creator: '@nawazel',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Optimize resource loading */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Viewport meta tag for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#ffffff" />
        
        {/* Disable automatic telephone number detection */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${dmSans.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <NuqsAdapter>
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
