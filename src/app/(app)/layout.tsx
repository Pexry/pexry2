import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";
import { faviconMetadata } from "@/lib/favicon";
import { PerformanceMonitor } from "@/components/performance-optimizer";
import { ServiceWorkerProvider } from "@/components/service-worker-provider";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: 'swap', // Font optimization without changing appearance
  preload: true, // Preload the font
});

export const metadata: Metadata = {
  title: "Pexry",
  description: "Buy and sell digital products on Pexry marketplace",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  ...faviconMetadata,
};

// Performance optimizations: preload critical resources
const PreloadResources = () => (
  <>
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="prefetch" href="/placeholder.png" />
  </>
);

// Memory management component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PreloadResources />
      </head>
      <body className={`${dmSans.className} antialiased`}>
        <NuqsAdapter>
          <TRPCReactProvider>
            <ServiceWorkerProvider />
            <PerformanceMonitor />
            {children}
            <Toaster />
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}


