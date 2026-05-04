'use client';

import React from 'react';
import { MOCK_BOOKINGS, MOCK_UNITS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ClientDashboardPage() {
  // We'll simulate that "أحمد يونس" is the logged-in client for this demo.
  const clientBookings = MOCK_BOOKINGS.filter(b => b.client === 'أحمد يونس');

  return (
    <div className="container mx-auto px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-brand-950">مرحباً، أحمد!</h1>
        <p className="text-gray-500 mt-2">تابع حجوزاتك الحالية والسابقة في Kaza Booking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 bg-white shadow-soft border-none rounded-3xl">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">إجمالي الحجوزات</h3>
          <p className="text-3xl font-black text-brand-950">{clientBookings.length}</p>
        </Card>
        <Card className="p-6 bg-white shadow-soft border-none rounded-3xl">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">الرحلات القادمة</h3>
          <p className="text-3xl font-black text-accent-600">1</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-brand-950 mb-6">رحلاتك</h2>
      
      {clientBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientBookings.map((booking, idx) => {
            const unit = MOCK_UNITS.find(u => u.id === booking.unitId);
            return (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-4 shadow-soft flex flex-col md:flex-row gap-6 border border-gray-100"
              >
                {unit?.images?.[0] && (
                  <div className="w-full md:w-48 h-40 rounded-2xl overflow-hidden shrink-0">
                    <img src={unit.images[0]} alt={unit.name} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-brand-950">{unit?.name || 'وحدة غير معروفة'}</h3>
                    <Badge className="bg-green-100 text-green-700 border-none font-bold">مؤكد</Badge>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Calendar className="w-4 h-4 text-brand-500" />
                      <span>{booking.checkIn} - {booking.checkOut}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <MapPin className="w-4 h-4 text-brand-500" />
                      <span>العلمين الجديدة</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-black text-brand-950">EGP {booking.total.toLocaleString()}</span>
                    <button className="text-sm font-bold text-accent-600 hover:text-accent-700 underline">تفاصيل الحجز</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-brand-50 rounded-3xl border border-brand-100">
          <h3 className="text-xl font-bold text-brand-950 mb-2">لا توجد حجوزات بعد</h3>
          <p className="text-gray-500 mb-6">ابدأ في استكشاف وحداتنا الفاخرة في العلمين.</p>
          <Link href="/">
            <button className="bg-brand-950 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-brand-800 transition-colors">
              تصفح الوحدات
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
