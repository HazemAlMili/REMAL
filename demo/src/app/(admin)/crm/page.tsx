"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_UNITS } from '@/lib/mock-data';
import { loadDemoLeads, type DemoLead } from '@/lib/demo-store';
import { Phone, Calendar, Clock, X, User, Mail, ShieldCheck, FileCheck, CheckCircle2, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CRMLead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  unitId: string;
  days: number;
  status: string;
  bookingRef?: string;
};

type CRMColumn = {
  id: string;
  title: string;
  color: string;
  leads: CRMLead[];
};

const CRM_COLUMNS_BASE = [
  { id: 'prospecting', title: 'محتمل (Prospecting)', color: 'bg-brand-50/30', leads: [
    { id: 'p1', name: 'محمود جلال', phone: '01029384756', source: 'Website', unitId: 'u1', days: 1, status: 'prospecting' },
    { id: 'p2', name: 'سارة خالد', phone: '01293847561', source: 'WhatsApp', unitId: 'u2', days: 2, status: 'prospecting' }
  ]},
  { id: 'relevant', title: 'مهتم (Relevant)', color: 'bg-brand-100/20', leads: [
    { id: 'r1', name: 'عمر طارق', phone: '01129348576', source: 'Instagram', unitId: 'u3', days: 4, status: 'relevant' }
  ]},
  { id: 'booked', title: 'تم الحجز (Soft Hold)', color: 'bg-accent-50/40', leads: [
    { id: 'b1', name: 'نورهان سعيد', phone: '01019283746', source: 'Website', unitId: 'u1', days: 0, status: 'booked' }
  ]},
  { id: 'confirmed', title: 'مؤكد (Confirmed)', color: 'bg-emerald-50/30', leads: [
    { id: 'c1', name: 'أحمد ربيع', phone: '01519283746', source: 'Referral', unitId: 'u2', days: 1, status: 'confirmed' }
  ]},
] as CRMColumn[];

function mapStoredLead(lead: DemoLead) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    source: lead.source,
    unitId: lead.unitId,
    days: lead.days,
    status: lead.status,
    bookingRef: lead.bookingRef,
  };
}

export default function CRMPage() {
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [dynamicColumns, setDynamicColumns] = useState<CRMColumn[]>(CRM_COLUMNS_BASE);

  useEffect(() => {
    const storedLeads = loadDemoLeads().map(mapStoredLead);

    if (!storedLeads.length) {
      setDynamicColumns(CRM_COLUMNS_BASE);
      return;
    }

    setDynamicColumns(CRM_COLUMNS_BASE.map((column) => {
      const mergedLeads = [...column.leads];
      storedLeads
        .filter((lead) => lead.status === column.id)
        .forEach((lead) => mergedLeads.unshift({ ...lead }));

      return { ...column, leads: mergedLeads };
    }));
  }, []);

  const getSourceColor = (source: string) => {
    switch(source) {
      case 'Website': return 'bg-purple-50 text-purple-900 border border-purple-100';
      case 'WhatsApp': return 'bg-emerald-50 text-emerald-900 border border-emerald-100';
      case 'Instagram': return 'bg-pink-50 text-pink-900 border border-pink-100';
      default: return 'bg-surface text-brand-900 border border-brand-50';
    }
  };

  const getUnitName = (id: string) => MOCK_UNITS.find(u => u.id === id)?.name || 'غير محدد';

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-brand-950 mb-2 tracking-tighter">إدارة المبيعات (CRM)</h1>
          <p className="text-gray-500 font-medium">متابعة مسار العملاء والحجوزات.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-surface border border-brand-50 text-brand-900 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-soft">
              فلترة
           </button>
           <button className="bg-brand-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-800 transition-colors shadow-soft hover:shadow-md">
             إضافة عميل جديد
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 min-w-max h-full items-start">
          {dynamicColumns.map(col => (
            <div key={col.id} className={`w-80 rounded-2xl p-4.5 flex flex-col h-full border border-gray-100/50 ${col.color} relative overflow-hidden backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-5 px-1 shrink-0 relative z-10">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{col.title}</h3>
                <span className="bg-white text-brand-900 text-xs font-black px-2.5 py-1 rounded-full shadow-sm border border-brand-50">{col.leads.length}</span>
              </div>
              
              <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-2 custom-scrollbar relative z-10">
                <AnimatePresence>
                  {col.leads.map((lead, idx) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        padding="none" 
                        className="p-5 cursor-pointer hover:border-brand-200 hover:shadow-soft transition-all bg-surface rounded-2xl group border-brand-50"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-bold text-brand-900 text-base leading-tight group-hover:text-brand-600 transition-colors">{lead.name}</div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${getSourceColor(lead.source)}`}>
                            {lead.source}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-500 mb-4 line-clamp-1">{getUnitName(lead.unitId)}</div>
                        
                        <div className="flex items-center justify-between border-t border-brand-50 pt-3">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                            منذ {lead.days} أيام
                          </div>
                          {lead.bookingRef ? <div className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{lead.bookingRef}</div> : null}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Drawer Overlay */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-brand-950/20 backdrop-blur-sm z-[100]"
            />
            
            <motion.div 
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-md bg-surface z-[110] shadow-[30px_0_60px_rgba(0,0,0,0.1)] flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-brand-50 bg-surface sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedLead(null)} className="p-2 -mr-2 rounded-full hover:bg-gray-50 transition-colors text-gray-500 hover:text-brand-900 border border-transparent hover:border-brand-50">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <h2 className="text-xl font-black text-brand-950 tracking-tight">ملف العميل المبدئي</h2>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors border border-transparent hover:border-brand-50"><MoreHorizontal className="w-5 h-5" strokeWidth={1.5} /></button>
              </div>

              <div className="p-6 space-y-8 flex-1">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-700 font-black text-2xl shrink-0 shadow-inner">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-950">{selectedLead.name}</h3>
                    <p className="text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${selectedLead.status === 'prospecting' ? 'bg-gray-400' : selectedLead.status === 'relevant' ? 'bg-blue-400' : selectedLead.status === 'booked' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                      {CRM_COLUMNS_BASE.find(c => c.id === selectedLead.status)?.title.split(' ')[0]}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <a href={`tel:${selectedLead.phone}`} className="flex-1 bg-surface border border-brand-100 text-brand-950 rounded-2xl py-3 flex flex-col items-center justify-center gap-1 hover:bg-brand-50 transition-colors shadow-soft hover:shadow-md">
                     <Phone className="w-5 h-5" strokeWidth={1.5} />
                     <span className="text-xs font-bold mt-1">اتصال</span>
                  </a>
                  <a href={`https://wa.me/${selectedLead.phone}`} target="_blank" rel="noreferrer" className="flex-1 bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] rounded-2xl py-3 flex flex-col items-center justify-center gap-1 hover:bg-[#D1FAE5] transition-colors shadow-soft hover:shadow-md">
                     <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                     <span className="text-xs font-bold mt-1">واتساب</span>
                  </a>
                  <button className="flex-1 bg-surface border border-brand-100 text-gray-600 rounded-2xl py-3 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors shadow-soft hover:shadow-md">
                     <Share2 className="w-5 h-5" strokeWidth={1.5} />
                     <span className="text-xs font-bold mt-1">مشاركة</span>
                  </button>
                </div>

                {/* Info Card */}
                <div className="bg-surface rounded-2xl p-5 space-y-4 border border-brand-100 shadow-soft">
                  <div className="flex items-start gap-3">
                     <Phone className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                     <div>
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">رقم الهاتف</div>
                       <div className="font-bold text-brand-900 direction-ltr text-right">{selectedLead.phone}</div>
                     </div>
                   </div>
                   <div className="w-full h-px bg-brand-50"></div>
                   <div className="flex items-start gap-3">
                     <User className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                     <div>
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">مصدر العميل</div>
                       <div className="font-bold text-brand-900">{selectedLead.source}</div>
                     </div>
                   </div>
                   <div className="w-full h-px bg-brand-50"></div>
                   <div className="flex items-start gap-3">
                     <FileCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                     <div>
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">الوحدة المستهدفة</div>
                       <div className="font-bold text-brand-900 text-sm leading-tight mt-1">{getUnitName(selectedLead.unitId)}</div>
                     </div>
                   </div>
                </div>

              </div>
              
              <div className="p-6 border-t border-brand-50 bg-surface sticky bottom-0 z-10">
                 <button className="w-full bg-brand-900 text-white rounded-xl py-4 font-bold transition-colors shadow-soft hover:shadow-md">
                    ترقية حالة العميل (Move Forward)
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}