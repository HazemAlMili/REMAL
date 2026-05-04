"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_UNITS } from '@/lib/mock-data';
import { TrendingUp, Users, Building, KanbanSquare, ArrowUpRight, MoreHorizontal, X, Check, Search, Calendar, FileText, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { motion, AnimatePresence } from 'framer-motion';

const kpis = [
  {
    title: "الإيرادات",
    subtitle: "هذا الشهر",
    value: "452,000",
    prefix: "EGP",
    increase: "+14.5%",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "success" as const,
  },
  {
    title: "حجوزات",
    subtitle: "جارية الآن",
    value: "32",
    prefix: "",
    increase: "+5 جديدة",
    icon: KanbanSquare,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "info" as const,
  },
  {
    title: "عملاء",
    subtitle: "مسجلون",
    value: "1,204",
    prefix: "",
    increase: "+120 شهر",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
    badge: "neutral" as const,
  },
  {
    title: "متاحة",
    subtitle: "من 80 وحدة",
    value: "47",
    prefix: "",
    increase: "58% إشغال",
    icon: Building,
    color: "text-amber-600",
    bg: "bg-amber-50",
    badge: "warning" as const,
  },
];

const RECENT_BOOKINGS = [
  { id: 'b1', guest: "أحمد السيد", unit: "فيلا مارينا A1", unitImg: MOCK_UNITS[0].images[0], dates: "12 - 15 أغسطس", status: "warning" as const, statusLabel: "قيد المراجعة", amount: "EGP 18,000", phone: "01011223344", pax: 4 },
  { id: 'b2', guest: "سارة محمود", unit: "شاليه العلمين B3", unitImg: MOCK_UNITS[1].images[0], dates: "20 - 25 أغسطس", status: "success" as const, statusLabel: "مؤكد", amount: "EGP 25,000", phone: "0123456789", pax: 2 },
  { id: 'b3', guest: "محمد خالد", unit: "فيلا النخيل", unitImg: MOCK_UNITS[0].images[1], dates: "1 - 5 سبتمبر", status: "success" as const, statusLabel: "مؤكد", amount: "EGP 32,000", phone: "01122334455", pax: 6 },
  { id: 'b4', guest: "نورا إبراهيم", unit: "شاليه الشاطئ C2", unitImg: MOCK_UNITS[1].images[2], dates: "10 - 14 أغسطس", status: "danger" as const, statusLabel: "ملغي", amount: "EGP 12,000", phone: "0100998877", pax: 2 },
  { id: 'b5', guest: "كريم عبد الله", unit: "فيلا مارينا A3", unitImg: MOCK_UNITS[0].images[2], dates: "5 - 10 سبتمبر", status: "warning" as const, statusLabel: "قيد المراجعة", amount: "EGP 22,000", phone: "01555555555", pax: 5 },
];

export default function AdminDashboardPage() {
  const [selectedBooking, setSelectedBooking] = useState<typeof RECENT_BOOKINGS[0] | null>(null);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative pb-10 md:pb-0">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-950 mb-1 tracking-tight">اللوحة الرئيسية 👋</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">ملخص أداء Kaza Booking اليوم</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-950 text-white px-5 py-3 md:py-2.5 rounded-xl font-bold hover:bg-brand-800 transition-all shadow-md text-sm cursor-pointer">
          <ArrowUpRight className="w-4 h-4" />
          تصدير التقرير
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl md:rounded-[1.5rem] p-4 md:p-6 border border-gray-100 shadow-sm hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-3 mb-4">
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <Badge variant={kpi.badge} className="text-[10px] md:text-xs font-bold leading-tight whitespace-nowrap self-start md:self-auto">{kpi.increase}</Badge>
            </div>

            <div>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{kpi.title}</p>
              <div className="text-lg md:text-2xl font-black text-brand-950 tracking-tighter truncate">
                {kpi.prefix && <span className="text-xs md:text-sm text-gray-400 mr-1">{kpi.prefix}</span>}
                {kpi.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings + Top Units */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bookings Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-gray-50">
            <h2 className="text-base md:text-lg font-black text-brand-950">أحدث الحجوزات</h2>
            <Link href={ROUTES.adminBookings} className="bg-brand-50 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold text-brand-900 transition-colors flex items-center gap-1">
              الكل <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full text-right h-full">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-4 font-semibold">العميل</th>
                  <th className="px-6 py-4 font-semibold">الوحدة</th>
                  <th className="px-6 py-4 font-semibold text-center">التواريخ</th>
                  <th className="px-6 py-4 font-semibold text-center">الحالة</th>
                  <th className="px-6 py-4 font-semibold text-left">القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_BOOKINGS.map((booking, idx) => (
                  <tr key={idx} onClick={() => setSelectedBooking(booking)} className="hover:bg-brand-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-black text-sm shrink-0 shadow-sm group-hover:border-brand-200 transition-all">
                          {booking.guest.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{booking.guest}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <img src={booking.unitImg} className="w-8 h-8 rounded-lg object-cover" alt="" />
                        {booking.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium text-center">{booking.dates}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={booking.status} className="text-xs font-bold px-3 py-1">{booking.statusLabel}</Badge>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-950 text-sm text-left">{booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-2 p-4 gap-3 bg-gray-50/50">
            {RECENT_BOOKINGS.map((booking, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedBooking(booking)}
                className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3 md:gap-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex flex-col justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                     <img src={booking.unitImg} className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm" alt="" />
                     <div className="min-w-0">
                       <h3 className="font-bold text-gray-900 text-[13px] tracking-tight leading-none mb-1 truncate">{booking.guest}</h3>
                       <p className="text-[10px] text-gray-500 font-medium truncate">{booking.unit}</p>
                     </div>
                  </div>
                  <Badge variant={booking.status} className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider self-start">{booking.statusLabel}</Badge>
                </div>
                
                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-50">
                  <span className="font-black text-brand-900 text-[13px]">{booking.amount}</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-bold truncate">{booking.dates}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Units Performance */}
        <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-gray-100 p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <h2 className="text-base md:text-lg font-black text-brand-950">أداء الوحدات</h2>
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:space-y-5 md:gap-0">
            {MOCK_UNITS.slice(0, 4).map((unit, i) => {
              const occupancy = [78, 62, 91, 45][i];
              return (
                <div key={unit.id} className="group cursor-pointer bg-gray-50/50 md:bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-start md:items-center mb-2">
                    <img
                      src={unit.images[0]}
                      alt={unit.name}
                      className="w-full h-20 md:w-11 md:h-11 rounded-xl object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                    />
                    <div className="w-full flex md:flex-1 justify-between items-center md:items-center min-w-0 mt-1 md:mt-0">
                      <div>
                        <p className="font-bold text-brand-950 text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{unit.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{unit.type}</p>
                      </div>
                      <span className="text-xs md:text-sm font-black text-brand-950">{occupancy}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 md:bg-gray-100 rounded-full h-1.5 mt-2">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${occupancy}%`,
                        background: occupancy > 80 ? '#10b981' : occupancy > 60 ? '#3b82f6' : '#f59e0b',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
              <span>الإشغال الإجمالي</span>
              <span className="text-emerald-600 font-black text-sm">69.5%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Queue / Booking Details Drawer Overlay */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
            />
            
            {/* Drawer (Mobile: Bottom Sheet, Desktop: Side Drawer) */}
            <motion.div 
              initial={{ x: window.innerWidth < 768 ? 0 : '-100%', y: window.innerWidth < 768 ? '100%' : 0, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ x: window.innerWidth < 768 ? 0 : '-100%', y: window.innerWidth < 768 ? '100%' : 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-0 md:right-auto md:w-full md:max-w-md bg-white z-50 shadow-2xl flex flex-col rounded-t-3xl md:rounded-none h-[85vh] md:h-auto overflow-hidden"

            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedBooking(null)} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-brand-950">
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-black text-brand-950">تفاصيل الحجز</h2>
                </div>
                <Badge variant={selectedBooking.status} className="font-bold">{selectedBooking.statusLabel}</Badge>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8 flex-1">
                {/* Guest Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 border-2 border-white shadow-sm flex items-center justify-center text-brand-700 font-black text-2xl shrink-0">
                    {selectedBooking.guest.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-950">{selectedBooking.guest}</h3>
                    <p className="text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> عميل موثق
                    </p>
                  </div>
                </div>

                {/* Key Details Card */}
                <div className="bg-gray-50 rounded-[1.5rem] p-5 space-y-4 border border-gray-100">
                   <div className="flex items-start gap-3">
                     <Calendar className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                     <div>
                       <div className="text-xs font-bold text-gray-400 uppercase">التواريخ</div>
                       <div className="font-black text-brand-950">{selectedBooking.dates}</div>
                     </div>
                   </div>
                   <div className="w-full h-px bg-gray-200"></div>
                   <div className="flex items-start gap-3">
                     <Users className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                     <div>
                       <div className="text-xs font-bold text-gray-400 uppercase">عدد الضيوف</div>
                       <div className="font-black text-brand-950">{selectedBooking.pax} أفراد</div>
                     </div>
                   </div>
                   <div className="w-full h-px bg-gray-200"></div>
                   <div className="flex items-start gap-3">
                     <FileText className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                     <div>
                       <div className="text-xs font-bold text-gray-400 uppercase">قيمة الحجز</div>
                       <div className="font-black text-brand-950 text-lg">{selectedBooking.amount}</div>
                     </div>
                   </div>
                </div>

                {/* Unit Details */}
                <div>
                  <h4 className="font-black text-brand-950 mb-4 text-lg">الوحدة المحجوزة</h4>
                  <div className="flex gap-4 p-4 rounded-[1.5rem] border border-gray-100 hover:border-brand-200 transition-colors cursor-pointer group">
                    <img src={selectedBooking.unitImg} alt="Unit" className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 flex flex-col justify-center">
                       <div className="font-black text-brand-950 text-lg group-hover:text-brand-700 transition-colors">{selectedBooking.unit}</div>
                       <Link href="/units/u1" className="text-sm font-bold text-brand-500 mt-1 flex items-center gap-1">عرض الوحدة <ArrowUpRight className="w-3 h-3" /></Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              {selectedBooking.status === 'warning' && (
                <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10 space-y-3">
                  <button className="w-full bg-brand-950 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-brand-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5" /> قبول الحجز (Confirm)
                  </button>
                  <button className="w-full bg-red-50 text-red-600 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                    <XCircle className="w-5 h-5" /> رفض الحجز
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
