import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: 'swap', // Font optimization without changing appearance
});

export const metadata: Metadata = {
  title: "Nawazel - Digital Marketplace",
  description: "Buy and sell digital products on Nawazel marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('RootLayout: Rendering');
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
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


