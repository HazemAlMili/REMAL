import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Inter, DM_Sans, Montserrat } from 'next/font/google';
import QueryProvider from '@/lib/providers/query-provider';
import SmoothScrollProvider from '@/lib/providers/smooth-scroll-provider';
import { ViewTransitions } from 'next-view-transitions';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ui',
  weight: ['400', '500', '600', '700'],
});
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-accent',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Rental Platform",
  description: "Discover luxury rental properties on the Egyptian coast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${playfair.variable} ${inter.variable} ${dmSans.variable} ${montserrat.variable}`}>
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
