'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/search', label: 'استكشف', icon: Search },
  { href: '/saved', label: 'المحفوظات', icon: Heart },
  { href: '/client-dashboard', label: 'حسابي', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/80 backdrop-blur-2xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around px-2 h-16 safe-area-inset-bottom">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200',
                isActive ? 'text-brand-950' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className={cn(
                'relative flex items-center justify-center w-9 h-9 rounded-2xl transition-all duration-200',
                isActive ? 'bg-brand-950/8 scale-110' : ''
              )}>
                <Icon className={cn('transition-all duration-200', isActive ? 'w-5 h-5 stroke-[2.5]' : 'w-5 h-5')} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-950" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-semibold transition-all duration-200',
                isActive ? 'text-brand-950' : 'text-gray-400'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
