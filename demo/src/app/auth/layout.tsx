import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(104,123,242,0.14),_transparent_38%),linear-gradient(180deg,#fafbfd_0%,#f5f7fb_100%)] text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3 font-bold text-2xl text-brand-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white">R</span>
            Kaza Booking Auth
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-brand-700 transition-colors">
            العودة للرئيسية
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}