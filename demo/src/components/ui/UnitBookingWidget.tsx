'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Info, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  unitId: string;
  basePrice: number;
}

export function UnitBookingWidget({ unitId, basePrice }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(new Date());
  const [checkOut, setCheckOut] = useState<Date | null>(addDays(new Date(), 3));
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [guests, setGuests] = useState(2);

  // Mock days
  const handleSelectDate = (date: Date) => {
    if (!checkIn || checkOut) {
      setCheckIn(date);
      setCheckOut(null);
    } else if (date > checkIn) {
      setCheckOut(date);
      setShowDatePicker(false); // Auto close
    } else {
      setCheckIn(date);
    }
  };

  const getNights = () => {
    if (checkIn && checkOut) {
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 3;
  };

  const nights = getNights();
  const subtotal = nights * basePrice;
  const serviceFee = nights * 500; // Simulated dynamic fee
  const total = subtotal + serviceFee;

  return (
    <>
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-brand-50">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-4xl font-black text-brand-950 tracking-tighter">
              EGP {basePrice.toLocaleString()}
            </span>
            <span className="text-gray-500 font-bold ml-1"> / ليلة</span>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
              أو حسب تاريخ رحلتك
            </p>
          </div>
        </div>

        <div className="border border-brand-50 rounded-2xl overflow-hidden mb-6 bg-surface shadow-sm">
          <div className="flex border-b border-brand-50 relative">
            <div 
              className="p-4 flex-1 border-l border-brand-50 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowDatePicker(true)}
            >
              <div className="text-[10px] font-black text-brand-950 uppercase mb-1">الوصول</div>
              <div className="text-sm font-bold text-gray-900 truncate">
                {checkIn ? format(checkIn, 'd MMM yyyy', { locale: ar }) : 'إضافة تاريخ'}
              </div>
            </div>
            <div 
              className="p-4 flex-1 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowDatePicker(true)}
            >
              <div className="text-[10px] font-black text-brand-950 uppercase mb-1">المغادرة</div>
              <div className="text-sm font-bold text-gray-900 truncate">
                {checkOut ? format(checkOut, 'd MMM yyyy', { locale: ar }) : 'إضافة تاريخ'}
              </div>
            </div>
          </div>
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center relative"
            onClick={() => setShowGuestsModal(!showGuestsModal)}
          >
            <div>
              <div className="text-[10px] font-black text-brand-950 uppercase mb-1">عدد الضيوف</div>
              <div className="text-sm font-bold text-gray-900">{guests} ضيوف</div>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showGuestsModal ? 'rotate-90' : ''}`} />
            
            {/* Quick Guest Dropdown popover */}
            <AnimatePresence>
              {showGuestsModal && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 z-20"
                >
                  <div className="flex items-center justify-between">
                     <span className="font-bold text-gray-700">شخص بالغ</span>
                     <div className="flex items-center gap-4">
                       <button 
                         className="w-8 h-8 rounded-full border flex items-center justify-center text-lg text-gray-500 disabled:opacity-50"
                         onClick={(e) => { e.stopPropagation(); setGuests(Math.max(1, guests - 1)); }}
                         disabled={guests <= 1}
                       >-</button>
                       <span className="font-bold w-4 text-center">{guests}</span>
                       <button 
                         className="w-8 h-8 rounded-full border flex items-center justify-center text-lg text-gray-500"
                         onClick={(e) => { e.stopPropagation(); setGuests(Math.min(10, guests + 1)); }}
                       >+</button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Link href={`/checkout?unitId=${unitId}&guests=${guests}`} className="block w-full text-center mb-6">
          <Button
            size="lg"
            className="w-full rounded-2xl py-8 text-xl bg-brand-950 hover:bg-brand-800 text-white font-black transition-all shadow-lg hover:scale-[1.02]"
          >
            اطلب Trust Pack
          </Button>
        </Link>

        <p className="text-xs text-center text-gray-500 mb-8 font-medium">
          لن يتم سحب أي مبلغ نقدي الآن. تأكيد الحجز يتم بعد مراجعة التفاصيل.
        </p>

        {checkIn && checkOut && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="space-y-4 pt-6 border-t border-brand-50"
          >
            <div className="flex items-center gap-2 mb-2 text-brand-950 font-black text-sm">
              <Info size={14} className="text-accent-500" strokeWidth={1.5} /> تفاصيل السعر
            </div>
            <div className="flex justify-between text-gray-500 font-medium text-sm">
              <span>EGP {basePrice.toLocaleString()} x {nights} ليالي</span>
              <span className="tracking-tight">EGP {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium text-sm">
              <span>رسوم خدمة وإدارة ضيافة</span>
              <span className="tracking-tight">EGP {serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black text-brand-950 pt-4 border-t border-brand-50 text-2xl tracking-tighter">
              <span>الإجمالي التقديري</span>
              <span>EGP {total.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Security Banner */}
      <div className="mt-8 bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 relative overflow-hidden group shadow-soft">
        <div className="absolute inset-0 bg-emerald-100/50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" strokeWidth={1.25} />
          <div>
            <h4 className="font-bold text-brand-950">حجز آمن 100%</h4>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed font-medium">
              نحن نضمن لك تطابق الوحدة مع الفيديو الفعلي. لا يتم تحويل أي مبالغ
              قبل مراجعة الـ Trust Pack الخاص بك بالكامل.
            </p>
          </div>
        </div>
      </div>

      {/* Date Picker Modal Backdrop (Mocked Calendar UX) */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 lg:p-0"
            onClick={() => setShowDatePicker(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-brand-950">اختيار التواريخ</h3>
                  <p className="text-gray-500 text-sm">حدد تاريخ الوصول والمغادرة</p>
                </div>
                <button onClick={() => setShowDatePicker(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Dummy Calendar Mock since react-day-picker styles need global css */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                 <div className="flex justify-between items-center mb-4">
                    <button className="p-1"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                    <span className="font-bold">{format(checkIn || new Date(), 'MMMM yyyy', { locale: ar })}</span>
                    <button className="p-1"><ChevronRight className="w-5 h-5" /></button>
                 </div>
                 {/* Calendar Grid Mock (just UI placeholder for interactivity demo) */}
                 <div className="grid grid-cols-7 gap-1 text-center mb-2">
                   {['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'].map(d => <div key={d} className="text-xs font-bold text-gray-400">{d}</div>)}
                 </div>
                 <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 31 }).map((_, i) => {
                      const day = i + 1;
                      const currentMockDate = addDays(new Date(), day - 10); // arbitrary spread
                      
                      const isCheckIn = checkIn && currentMockDate.getDate() === checkIn.getDate();
                      const isCheckOut = checkOut && currentMockDate.getDate() === checkOut.getDate();
                      const isBetween = checkIn && checkOut && currentMockDate > checkIn && currentMockDate < checkOut;
                      
                      // Base classes
                      let classes = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mx-auto cursor-pointer transition-all hover:border hover:border-brand-950 ";
                      
                      if (isCheckIn || isCheckOut) {
                         classes += "bg-brand-950 text-white shadow-md transform scale-110 ";
                      } else if (isBetween) {
                         classes += "bg-gray-200 text-brand-950 rounded-none ";
                      } else {
                         classes += "bg-white text-gray-700 ";
                      }

                      return (
                        <div 
                          key={i} 
                          className={classes}
                          onClick={() => handleSelectDate(currentMockDate)}
                        >
                          {day}
                        </div>
                      )
                    })}
                 </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button onClick={() => { setCheckIn(null); setCheckOut(null); }} className="text-gray-500 font-bold underline">مسح التواريخ</button>
                <Button onClick={() => setShowDatePicker(false)} className="bg-brand-950 text-white rounded-xl px-8">تأكيد</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}