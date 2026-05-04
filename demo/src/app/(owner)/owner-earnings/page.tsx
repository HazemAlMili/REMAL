"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Wallet, ArrowDownCircle, ArrowUpRight, HandCoins } from 'lucide-react';

const OWNER_TRANSACTIONS = [
  { id: 1, unit: 'فيلا بانورامية بالدور 35', description: 'إيراد حجز #MB2309', total: 42500, myCut: 34000, type: 'credit', status: 'ready', date: '21 يوليو 2026' },
  { id: 2, unit: 'فيلا بانورامية بالدور 35', description: 'تحويل نقدي للمالك', total: 0, myCut: -85000, type: 'debit', status: 'paid', date: '1 يوليو 2026' },
  { id: 3, unit: 'فيلا بانورامية بالدور 35', description: 'إيراد حجز #MB1023', total: 106250, myCut: 85000, type: 'credit', status: 'paid', date: '28 يونيو 2026' }
];

export default function OwnerEarningsPage() {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">أرباحي ودفعاتي</h1>
          <p className="text-gray-500 font-medium">متابعة إيرادات حجوزاتك، ودفعاتك المحولة من Kaza Booking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <Card padding="lg" className="bg-white border-none shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><Wallet className="w-6 h-6" /></div>
            <div className="text-gray-500 font-medium">إجمالي المستحق لي</div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-2">EGP 34,000</div>
          <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
             <span className="bg-emerald-50 px-2 py-0.5 rounded-full">+ 1 حجز مؤكد</span>
          </div>
        </Card>

        <Card padding="lg" className="bg-white border-none shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><HandCoins className="w-6 h-6" /></div>
            <div className="text-gray-500 font-medium">إجمالي ما تم تحويله بالكامل</div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-2">EGP 136,000</div>
          <div className="text-sm text-gray-400 font-medium">
            حتى آخر شهر
          </div>
        </Card>
      </div>

      <Card padding="none" className="bg-white flex-1 overflow-hidden shadow-soft flex flex-col border-none">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">سجل الحساب المالي</h2>
        </div>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
              <tr>
                <th className="font-medium p-4 pl-6">التاريخ</th>
                <th className="font-medium p-4">الوصف</th>
                <th className="font-medium p-4">قيمة الإيراد بالكامل للوحدة</th>
                <th className="font-medium p-4">ربحي (بدون العمولة)</th>
                <th className="font-medium p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
               {OWNER_TRANSACTIONS.map(txn => (
                 <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-500">{txn.date}</td>
                    <td className="p-4">
                       <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                         {txn.type === 'debit' ? <ArrowDownCircle className="w-4 h-4 text-orange-500" /> : <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                         {txn.description}
                       </div>
                       <div className="text-xs text-gray-500 truncate max-w-[200px]">{txn.unit}</div>
                    </td>
                    <td className="p-4 text-gray-500 font-medium">{txn.type === 'debit' ? '-' : `EGP ${txn.total.toLocaleString()}`}</td>
                    <td className={`p-4 font-bold ${txn.type === 'debit' ? 'text-orange-600' : 'text-emerald-600'}`}>
                       {txn.type === 'debit' ? '-' : '+ '} EGP {Math.abs(txn.myCut).toLocaleString()}
                    </td>
                    <td className="p-4">
                       {txn.status === 'paid' ? 
                         <Badge variant="neutral">تم التسوية والتحويل</Badge> : 
                         <Badge variant="success">رصيد متاح</Badge>
                       }
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}