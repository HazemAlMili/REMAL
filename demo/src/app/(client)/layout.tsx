import React from 'react';
import { Navbar } from '@/components/layout/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 w-full relative z-0 pt-28 pb-20">
        {children}
      </main>
      <footer className="bg-surface border-t border-gray-100 py-8 text-gray-500 relative z-10 text-center">
        <p className="text-sm font-medium">© 2024 Kaza Booking. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
