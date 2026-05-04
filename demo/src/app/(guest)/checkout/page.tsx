"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MOCK_UNITS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { ChevronRight, User, ShieldCheck, CheckCircle2, MessageCircle, Star, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CheckoutSummaryContent() {
  const searchParams = useSearchParams();
  const unitId = searchParams.get('unitId');
  const unit = MOCK_UNITS.find(u => u.id === unitId) || MOCK_UNITS[0];

  const [name, setName] = useState('');
  const [guests, setGuests] = useState('2');
  const [dates, setDates] = useState('20-23 أغسطس');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateWhatsAppLink = () => {
    const phone = "201000082960";
    const text = `أهلاً Kaza Booking، عايز Trust Pack للوحدة دي:
Unit: ${unit.name}
ID: ${unit.id}
الاسم: ${name || 'لم يتم إدخاله'}
التواريخ: ${dates}
عدد الأفراد: ${guests}
السعر التقديري: ${(unit.basePrice * 3 + 1500).toLocaleString()} ج.م`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate Premium API request processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Auto redirect to WhatsApp after 2 seconds showing success
      setTimeout(() => {
         window.open(generateWhatsAppLink(), '_blank');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F9] pt-32 pb-20 font-sans dir-rtl">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <Link href={`/units/${unit.id}`} className="flex items-center gap-2 text-gray-500 hover:text-brand-950 mb-8 w-fit transition-colors font-bold">
          <ChevronRight className="w-5 h-5" />
          <span>العودة لتفاصيل الوحدة</span>
        </Link>
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-brand-950 mb-3 tracking-tight">اطلب Trust Pack للوحدة</h1>
          <p className="text-gray-500 text-lg font-medium">خطوة واحدة وتستلم فيديو فعلي، تفاصيل السعر، والقواعد قبل أي عربون.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          
          {/* Form Side */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
              <h2 className="text-2xl font-black text-brand-950 mb-8">بيانات طلبك</h2>
              
              <div className="space-y-8">
                <div>
                  <label className="text-sm font-black text-brand-950 mb-3 block">الاسم بالكامل</label>
                  <input 
                    type="text" 
                    placeholder="مثال: محمد أحمد" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand-950 transition-colors font-medium shadow-sm" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-black text-brand-950 mb-3 block">التواريخ المتوقعة</label>
                    <input 
                      type="text" 
                      value={dates} 
                      onChange={(e) => setDates(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand-950 transition-colors font-medium shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-brand-950 mb-3 block">عدد الضيوف</label>
                    <select 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand-950 transition-colors appearance-none font-medium shadow-sm"
                    >
                      <option value="1">1 ضيف</option>
                      <option value="2">2 ضيوف</option>
                      <option value="3">3 ضيوف</option>
                      <option value="4">4 ضيوف</option>
                      <option value="5">5 ضيوف</option>
                      <option value="6">6 ضيوف</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
              <h2 className="text-2xl font-black text-brand-950 mb-6 flex items-center gap-3">
                 <ShieldCheck className="text-emerald-500" /> ليه بنحجز عبر واتساب؟
              </h2>
              <p className="text-gray-500 leading-relaxed font-medium">
                لحماية جودة الحجز، Kaza Booking بتبعتلك فيديو فعلي للوحدة وتفاصيل السعر الرسمية وتتأكد من توافر التاريخ قبل أي تحويل عربون. عند الضغط على الزر، هيفتح واتساب برسالة جاهزة بفيديو الوحدة اللي اخترتها.
              </p>
            </div>
          </div>

          {/* Summary Side */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 sticky top-32">
              <div className="flex gap-4 mb-8">
                <img src={unit.images[0]} alt={unit.name} className="w-24 h-24 object-cover rounded-2xl shadow-sm" />
                <div className="flex flex-col justify-center">
                  <div className="text-[10px] text-accent-600 font-black uppercase mb-1">{unit.type}</div>
                  <h3 className="font-black text-brand-950 leading-tight mb-2">{unit.name}</h3>
                  <div className="text-xs text-gray-500">
                    <Star className="w-3 h-3 inline-block fill-brand-950 text-brand-950 ml-1" />
                    <span className="font-black text-brand-950">{unit.rating || '4.9'}</span> (12 تقييم)
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-brand-950 font-black text-sm">
                   <Info size={14} className="text-accent-500" /> تفاصيل السعر التقديرية
                </div>
                <div className="flex justify-between text-gray-500 font-medium text-sm">
                  <span>EGP {unit.basePrice.toLocaleString()} x 3 ليالي</span>
                  <span>EGP {(unit.basePrice * 3).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium text-sm">
                  <span>رسوم خدمة Kaza Booking (تقديرية)</span>
                  <span>EGP 1,500</span>
                </div>
                <div className="flex justify-between font-black text-brand-950 pt-4 border-t border-gray-100 text-xl">
                  <span>الإجمالي التقديري</span>
                  <span>EGP {(unit.basePrice * 3 + 1500).toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={isProcessing || isSuccess}
                className={`block w-full mt-8 rounded-2xl py-6 text-xl font-black transition-all shadow-lg flex items-center justify-center gap-3 relative overflow-hidden ${
                  isSuccess 
                    ? 'bg-emerald-500 text-white hover:scale-100 cursor-default'
                    : 'bg-[#25D366] hover:bg-[#128C7E] text-white hover:scale-[1.02]'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                       <Loader2 className="w-6 h-6 animate-spin" /> جاري التجهيز...
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                       <CheckCircle2 className="w-6 h-6" /> سيتم تحويلك لواتساب
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                       <MessageCircle className="w-6 h-6" /> اطلب Trust Pack
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Visual loading bar effect */}
                {isProcessing && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5 }}
                    className="absolute bottom-0 left-0 h-1 bg-white/30"
                  />
                )}
              </button>
              
              <div className="mt-6 flex items-start justify-center gap-2 text-center">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Smar Verified Experience</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutSimulatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-24 pb-20" />}>
      <CheckoutSummaryContent />
    </Suspense>
  );
}