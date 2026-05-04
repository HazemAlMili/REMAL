"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, KanbanSquare, Building2, CalendarDays, UsersRound, UserRound, Wallet, Star, Settings, LogOut, Search, Bell, MapPinned, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/constants/routes';
import { clearDemoRoleCookie } from '@/lib/auth-client';
import { AnimatePresence, motion } from 'framer-motion';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'اللوحة', href: ROUTES.adminDashboard },
  { icon: KanbanSquare, label: 'CRM', href: ROUTES.adminCrm, hideOnMobile: true },
  { icon: CalendarDays, label: 'الحجوزات', href: ROUTES.adminBookings },
  { icon: Building2, label: 'الوحدات', href: ROUTES.adminUnits },
  { icon: MapPinned, label: 'المناطق', href: ROUTES.adminAreas, hideOnMobile: true },
  { icon: UsersRound, label: 'العملاء', href: ROUTES.adminClients },
  { icon: UserRound, label: 'الملاك', href: ROUTES.adminOwners, hideOnMobile: true },
  { icon: Wallet, label: 'الماليات', href: ROUTES.adminFinance, hideOnMobile: true },
  { icon: Star, label: 'المراجعات', href: ROUTES.adminReviews, hideOnMobile: true },
  { icon: Settings, label: 'الإعدادات', href: ROUTES.adminSettings, hideOnMobile: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearDemoRoleCookie();
    router.push(ROUTES.authAdminLogin);
    router.refresh();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      
      {/* Mobile Sticky Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-gray-200 sticky top-0 z-40 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center text-white font-bold text-sm">KB</div>
          <span className="font-black text-brand-950 tracking-tight">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center text-gray-600">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-brand-900 border border-gray-200">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop(280px) & Tablet(80px) */}
      <aside className="hidden md:flex w-[80px] lg:w-72 bg-white border-l border-gray-200 flex-col h-full shadow-soft z-20 relative shrink-0 transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-gray-100 shrink-0">
          <Link href={ROUTES.adminDashboard} className="font-bold text-xl lg:text-2xl tracking-tight text-brand-900 flex items-center gap-3">
            <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-brand-600 flex items-center justify-center text-white shrink-0 transition-all shadow-sm">
              <span className="text-lg">K</span>
            </div>
            <span className="hidden lg:block whitespace-nowrap">Kaza Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 lg:px-4 px-2 flex flex-col gap-2 scrollbar-none hover:scrollbar-thin">
          {MENU_ITEMS.map((item, idx) => {
            const isActive = pathname?.startsWith(item.href);
            
            return (
              <Link key={idx} href={item.href} className={cn(
                "flex items-center justify-center lg:justify-start gap-3 lg:px-4 py-3.5 lg:py-3 rounded-2xl lg:rounded-xl font-medium transition-all duration-200 group relative",
                isActive ? "bg-brand-50 text-brand-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                {isActive && <div className="absolute right-1 lg:right-0 top-1/2 -translate-y-1/2 w-1 lg:w-1 h-4 lg:h-full bg-brand-600 rounded-full" />}
                <item.icon className={cn("w-6 h-6 lg:w-5 lg:h-5 shrink-0 transition-transform", isActive ? "text-brand-600" : "text-gray-400 group-hover:scale-110")} />
                <span className="hidden lg:block truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-100 lg:block flex justify-center shrink-0">
          <button type="button" onClick={handleLogout} className="flex items-center justify-center lg:justify-start gap-3 h-12 lg:h-auto lg:px-4 lg:py-3 rounded-full lg:rounded-xl font-medium text-red-600 hover:bg-red-50 w-12 lg:w-full transition-all">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[68px] md:pb-0">
        {/* Top Header - Desktop Only */}
        <header className="hidden md:flex h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200 items-center justify-between px-8 z-10 w-full transition-all">
          <div className="flex items-center gap-4 w-96 max-w-full">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="ابحث عن وحدة، عميل، أو حجز..." 
                className="w-full bg-gray-100/80 rounded-full py-2.5 pr-12 pl-6 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
            <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold overflow-hidden border border-brand-200 shrink-0 shadow-sm">
                <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col hidden lg:flex">
                <span className="font-bold text-sm leading-tight text-gray-900 whitespace-nowrap">محمد علي</span>
                <span className="text-xs text-gray-500">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-between px-2 pt-2 pb-safe-bottom h-[68px] z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        {MENU_ITEMS.filter(item => !item.hideOnMobile).map((item, idx) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link key={idx} href={item.href} className="flex flex-col items-center justify-center w-full py-1">
              <div className={cn("flex flex-col items-center justify-center p-1.5 px-4 rounded-full transition-all duration-300", isActive ? "bg-brand-50 text-brand-700" : "text-gray-400")}>
                <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={cn("text-[10px] tracking-tight", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Mobile Drawer (Hamburger Menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-white rounded-t-3xl p-6 relative z-10 max-h-[85vh] overflow-y-auto flex flex-col"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {MENU_ITEMS.filter(item => item.hideOnMobile).map((item, idx) => (
                  <Link key={idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 text-gray-900 transition-colors">
                    <div className="bg-brand-100/50 p-2 rounded-xl"><item.icon className="w-5 h-5 text-brand-700" strokeWidth={1.5} /></div>
                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-auto border-t border-gray-100 pt-4 flex flex-col gap-2">
                <Link href={ROUTES.adminSettings} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 font-bold py-3 rounded-2xl bg-gray-50 text-gray-900">
                  <Settings className="w-5 h-5" /> الإعدادات
                </Link>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
