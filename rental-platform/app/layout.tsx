import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
import QueryProvider from '@/lib/providers/query-provider';
import SmoothScrollProvider from '@/lib/providers/smooth-scroll-provider';
import { ViewTransitions } from 'next-view-transitions';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Rental Platform",
  description: "Rental Property Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={inter.variable}>
        <body className="font-sans bg-background text-foreground">
          <QueryProvider>
            <SmoothScrollProvider>
              {children}
            </SmoothScrollProvider>
          </QueryProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
