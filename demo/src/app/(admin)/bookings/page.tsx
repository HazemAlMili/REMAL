"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_BOOKINGS, MOCK_UNITS } from '@/lib/mock-data';
import { CalendarDays, Clock3, CheckCircle2, Wallet, UsersRound } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'booked', label: 'Soft Hold' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

function getStatusInfo(status: string) {
  switch (status) {
    case 'booked': return { label: 'Soft Hold', variant: 'warning' as const };
    case 'confirmed': return { label: 'Confirmed', variant: 'info' as const };
    case 'completed': return { label: 'Completed', variant: 'success' as const };
    case 'cancelled': return { label: 'Cancelled', variant: 'danger' as const };
    default: return { label: status, variant: 'neutral' as const };
  }
}

export default function BookingsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');

  const bookings = useMemo(() => {
    return filter === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter((booking) => booking.status === filter);
  }, [filter]);

  const summary = [
    { title: 'إجمالي الطلبات', value: MOCK_BOOKINGS.length, icon: CalendarDays },
    { title: 'قيد الحجز', value: MOCK_BOOKINGS.filter((booking) => booking.status === 'booked').length, icon: Clock3 },
    { title: 'المؤكدة', value: MOCK_BOOKINGS.filter((booking) => booking.status === 'confirmed').length, icon: CheckCircle2 },
    { title: 'إجمالي القيمة', value: `EGP ${MOCK_BOOKINGS.reduce((sum, booking) => sum + booking.total, 0).toLocaleString()}`, icon: Wallet },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">الحجوزات</h1>
          <p className="text-gray-500 font-medium">لوحة عرض سريعة لكل حالة حجز في العرض التقديمي.</p>
        </div>
        <Badge variant="success" className="px-4 py-2 text-sm">{MOCK_BOOKINGS.filter((booking) => booking.status === 'confirmed').length} confirmed</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summary.map((item) => (
          <Card key={item.title} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center"><item.icon className="w-6 h-6" /></div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === tab.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm">
                <th className="pb-3 font-medium">العميل</th>
                <th className="pb-3 font-medium">الوحدة</th>
                <th className="pb-3 font-medium">الوصول</th>
                <th className="pb-3 font-medium">الضيوف</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const statusInfo = getStatusInfo(booking.status);

                return (
                  <tr key={booking.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 font-bold text-gray-900">{booking.client}</td>
                    <td className="py-4 text-gray-600">{MOCK_UNITS.find((unit) => unit.id === booking.unitId)?.name}</td>
                    <td className="py-4 text-gray-600">{booking.checkIn} → {booking.checkOut}</td>
                    <td className="py-4 text-gray-600 flex items-center gap-2"><UsersRound className="w-4 h-4" /> {booking.guests}</td>
                    <td className="py-4"><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></td>
                    <td className="py-4 font-bold text-gray-900">EGP {booking.total.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}