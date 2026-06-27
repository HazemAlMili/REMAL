'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/AuthProvider';
import { platformAuthUrl } from '@/lib/auth/platform';

const PLATFORM_URL = (process.env.NEXT_PUBLIC_PLATFORM_URL ?? '').replace(/\/+$/, '');

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Don't show bottom nav on owner/admin pages
  if (pathname.includes('/admin') || pathname.includes('/owner') || pathname.includes('/dashboard')) {
    return null;
  }

  // Account & favorites live on the platform (the storefront stays anonymous).
  // Authenticated → platform account; otherwise hand off to platform login.
  const handleAccount = () => {
    window.location.assign(
      isAuthenticated && PLATFORM_URL ? `${PLATFORM_URL}/account` : platformAuthUrl('login')
    );
  };

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'البحث', path: '/search', icon: Search },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-safe z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full relative ${isActive ? 'text-brand-950' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-3 w-10 h-1 bg-brand-950 rounded-b-full"
                />
              )}
              <item.icon size={22} className={isActive ? 'fill-brand-950/10' : ''} />
              <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-brand-950' : ''}`}>{item.name}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleAccount}
          className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-gray-600"
        >
          <Heart size={22} />
          <span className="text-[10px] mt-1 font-bold">المفضلة</span>
        </button>

        <button
          type="button"
          onClick={handleAccount}
          className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-gray-600"
        >
          <User size={22} />
          <span className="text-[10px] mt-1 font-bold">حسابي</span>
        </button>
      </div>
    </div>
  );
}
