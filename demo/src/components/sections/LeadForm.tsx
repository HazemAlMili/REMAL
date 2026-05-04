'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send, Calendar, Users, MapPin, Wallet, Home, MessageSquare } from 'lucide-react';

export function LeadForm() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
    tripType: 'عائلة',
    budget: '10–15k',
    area: 'مش محدد',
    rooms: '1BR',
    readyToDeposit: 'نعم',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  if (step === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 md:p-12 shadow-premium text-center border border-emerald-100"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-brand-950 mb-4">تم استلام طلبك بنجاح!</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">
          فريق Kaza Booking هيراجع التاريخ والميزانية ويبعتلك أنسب اختيارات متاحة بفيديو فعلي وتفاصيل واضحة على واتساب قريباً.
        </p>
        <Button onClick={() => setStep('form')} variant="outline" className="rounded-full px-8">إرسال طلب آخر</Button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-premium border border-gray-100 overflow-hidden">
      <div className="bg-brand-950 p-8 text-white text-center">
        <h3 className="text-2xl font-black mb-2">خلينا نرشحلك الوحدة الأنسب</h3>
        <p className="text-brand-200 text-sm">جاوب على كام سؤال بسيط، ونبعتلك أفضل 2–3 اختيارات مناسبة.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Name & Phone */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> الاسم
            </label>
            <input 
              required
              type="text" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors"
              placeholder="مثال: محمد أحمد"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> رقم الواتساب
            </label>
            <input 
              required
              type="tel" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors text-left"
              placeholder="+20 100 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-500" /> تاريخ الوصول
            </label>
            <input 
              required
              type="date" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors"
              value={formData.checkIn}
              onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-500" /> تاريخ الخروج
            </label>
            <input 
              required
              type="date" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors"
              value={formData.checkOut}
              onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
            />
          </div>

          {/* Guests & Trip Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-500" /> عدد الأفراد
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors appearance-none"
              value={formData.guests}
              onChange={(e) => setFormData({...formData, guests: e.target.value})}
            >
              <option value="1">1 فرد</option>
              <option value="2">2 أفراد</option>
              <option value="4">4 أفراد</option>
              <option value="6">6+ أفراد</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <Home className="w-4 h-4 text-accent-500" /> نوع الرحلة
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors appearance-none"
              value={formData.tripType}
              onChange={(e) => setFormData({...formData, tripType: e.target.value})}
            >
              <option value="كابل">كابل</option>
              <option value="هاني مون">هاني مون</option>
              <option value="عائلة">عائلة</option>
              <option value="شباب">شباب</option>
            </select>
          </div>

          {/* Budget & Area */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-accent-500" /> الميزانية (في الليلة)
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors appearance-none"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            >
              <option value="5–10k">5–10k EGP</option>
              <option value="10–15k">10–15k EGP</option>
              <option value="15k+">15k+ EGP</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-500" /> المنطقة المفضلة
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors appearance-none"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
            >
              <option value="مش محدد">مش محدد</option>
              <option value="أبراج العلمين">أبراج العلمين</option>
              <option value="مزارين">مزارين</option>
              <option value="ذا جيت">ذا جيت</option>
              <option value="بالم هيلز">بالم هيلز</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-brand-950 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-500" /> ملاحظات إضافية
          </label>
          <textarea 
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand-950 transition-colors"
            placeholder="أي تفاصيل أخرى حابب توضحها..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <Button type="submit" size="lg" className="w-full rounded-xl py-6 bg-brand-950 text-white hover:bg-brand-800 font-bold gap-2 text-lg">
          <Send size={18} />
          ابعتلي الترشيحات المناسبة
        </Button>
      </form>
    </div>
  );
}
