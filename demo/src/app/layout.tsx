import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { BottomNav } from '@/components/ui/BottomNav';
import { Toaster } from 'sonner';

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaza Booking - Premium Property Management",
  description: "Luxury stays in Alamein, North Coast and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <BottomNav />
        <Toaster position="top-center" richColors theme="light" dir="rtl" />
      </body>
    </html>
  );
}
