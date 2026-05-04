'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/areas', label: 'الوجهات' },
  { href: '/about', label: 'كيف نعمل' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-gray-100 py-4 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group transition-all duration-300"
            dir="ltr"
          >
            <span className="font-black text-2xl tracking-tighter transition-colors text-brand-950">
              Kaza Booking
            </span>
          </Link>

          {/* Desktop Nav - Clean & Classic */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[15px] font-bold transition-all duration-200 relative',
                    isActive ? 'text-brand-900' : 'text-gray-600 hover:text-brand-900'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-900" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="https://wa.me/201000082960" target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2 text-[15px] font-bold transition-all duration-300 hover:opacity-80 text-gray-700">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                المساعدة
              </button>
            </Link>

            <div className="w-px h-6 bg-gray-300 opacity-100" />

            <Link href={ROUTES.authClientLogin}>
              <button className="text-[15px] font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-brand-950 text-white">
                تسجيل الدخول
              </button>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl transition-all duration-200 border text-brand-950 bg-gray-50 border-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-xs bg-white flex flex-col shadow-2xl md:hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2 group relative z-10" dir="ltr">
                  <span className="font-black text-2xl italic tracking-tighter text-brand-950 group-hover:text-accent-600 transition-colors">Kaza Booking</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                {NAV_LINKS.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-4 py-4 rounded-2xl mb-1 font-bold text-base transition-colors',
                          isActive
                            ? 'bg-brand-950 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {item.label}
                        <span className={isActive ? 'text-white/60' : 'text-gray-300'}>›</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Bottom CTAs */}
              <div className="px-4 py-6 border-t border-gray-100 space-y-3">
                <Link
                  href="https://wa.me/201000082960"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white bg-[#25D366] hover:bg-[#128C7E] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  تواصل عبر واتساب
                </Link>
                <Link
                  href={ROUTES.authClientLogin}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-4 rounded-2xl font-bold text-brand-950 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
