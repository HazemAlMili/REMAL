"use client";

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, DollarSign, TrendingUp, HandCoins } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_BOOKINGS, MOCK_UNITS } from '@/lib/mock-data';

const FINANCE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'payouts', label: 'Payouts' },
] as const;

function getPaymentBadge(status: string) {
  return status === 'paid'
    ? { label: 'تم الدفع (Instapay)', variant: 'success' as const }
    : { label: 'في الانتظار', variant: 'warning' as const };
}

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState<(typeof FINANCE_TABS)[number]['id']>('overview');

  const transactions = MOCK_BOOKINGS.map((booking) => ({
    id: booking.id,
    client: booking.client,
    owner: booking.unitId === 'u1' ? 'أحمد منصور' : booking.unitId === 'u2' ? 'سارة رمزي' : 'محمد كمال',
    unit: MOCK_UNITS.find((unit) => unit.id === booking.unitId)?.name || '—',
    total: booking.total,
    commission: Math.round(booking.total * 0.2),
    ownerNet: booking.ownerNet,
    status: booking.status === 'completed' || booking.status === 'confirmed' ? 'paid' : 'pending',
    date: booking.checkIn,
  }));

  const payouts = [
    { owner: 'أحمد منصور', amount: 34000, status: 'ready' },
    { owner: 'سارة رمزي', amount: 12480, status: 'paid' },
    { owner: 'محمد كمال', amount: 6720, status: 'ready' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8 gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">الماليات والدفعات</h1>
          <p className="text-gray-500 font-medium">متابعة الإيرادات، العمولة، ومستحقات الملاك.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="px-4 py-2 text-sm">Live mock data</Badge>
          <Button variant="primary" className="rounded-xl shadow-soft">تصدير التقرير (Excel)</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {FINANCE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'overview' || activeTab === 'transactions' || activeTab === 'payouts') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card padding="lg" className="bg-white border-none shadow-soft">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><Wallet className="w-6 h-6" /></div>
              <div className="text-gray-500 font-medium">إجمالي الإيرادات</div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-2">EGP 824,500</div>
            <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+14.5% عن الشهر الماضي</span>
            </div>
          </Card>

          <Card padding="lg" className="bg-white border-none shadow-soft">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
              <div className="text-gray-500 font-medium">عمولة المنصة</div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-2">EGP 164,900</div>
            <div className="flex items-center gap-1 text-sm text-gray-400 font-medium">
              <span>متوسط 20% عمولة</span>
            </div>
          </Card>

          <Card padding="lg" className="bg-white border-none shadow-soft border border-orange-100/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><HandCoins className="w-6 h-6" /></div>
              <div className="text-gray-500 font-medium">مستحق للملاك</div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-2">EGP 124,000</div>
            <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>جاهزة للتحويل</span>
            </div>
          </Card>

          <Card padding="lg" className="bg-white border-none shadow-soft">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ArrowDownRight className="w-6 h-6" /></div>
              <div className="text-gray-500 font-medium">تم تحويله للملاك</div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-2">EGP 535,600</div>
            <div className="text-sm text-gray-400 font-medium">حتى تاريخه</div>
          </Card>
        </div>
      )}

      {(activeTab === 'overview' || activeTab === 'transactions') && (
        <Card padding="none" className="bg-white flex-1 overflow-hidden shadow-soft flex flex-col border-none">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">سجل المعاملات الأخير</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right">
              <thead className="bg-gray-50/50 text-gray-500 text-sm">
                <tr>
                  <th className="font-medium p-4 pl-6">تاريخ الحجز</th>
                  <th className="font-medium p-4">العميل / الوحدة</th>
                  <th className="font-medium p-4">المالك</th>
                  <th className="font-medium p-4">الإجمالي</th>
                  <th className="font-medium p-4">عمولة المنصة</th>
                  <th className="font-medium p-4">مستحق المالك</th>
                  <th className="font-medium p-4">حالة الدفع للمالك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {transactions.map((txn) => {
                  const paymentBadge = getPaymentBadge(txn.status);

                  return (
                    <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6 text-gray-500 whitespace-nowrap">{txn.date}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{txn.client}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{txn.unit}</div>
                      </td>
                      <td className="p-4 font-medium text-gray-700">{txn.owner}</td>
                      <td className="p-4 font-bold text-gray-900">EGP {txn.total.toLocaleString()}</td>
                      <td className="p-4 font-bold text-emerald-600">EGP {txn.commission.toLocaleString()}</td>
                      <td className="p-4 font-bold text-gray-900">EGP {txn.ownerNet.toLocaleString()}</td>
                      <td className="p-4">
                        {txn.status === 'paid' ? (
                          <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>
                        ) : (
                          <Button variant="secondary" size="sm" className="h-8 text-xs border text-orange-600 border-orange-200 hover:bg-orange-50">تأكيد الدفع</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'payouts' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">دفعات الملاك</h2>
            <Badge variant="warning">2 ready • 1 paid</Badge>
          </div>
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div key={payout.owner} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <div className="font-bold text-gray-900">{payout.owner}</div>
                  <div className="text-sm text-gray-500 mt-1">EGP {payout.amount.toLocaleString()}</div>
                </div>
                <Badge variant={payout.status === 'paid' ? 'success' : 'warning'}>{payout.status === 'paid' ? 'تم التحويل' : 'جاهز للصرف'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
