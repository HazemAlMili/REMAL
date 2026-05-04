"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_AMENITIES } from '@/lib/mock-data';
import { Bell, ShieldCheck, Sparkles, UsersRound, Plus, CheckCircle2 } from 'lucide-react';

const SETTINGS_TABS = [
  { id: 'amenities', label: 'Amenities' },
  { id: 'admins', label: 'Admins' },
  { id: 'notifications', label: 'Notifications' },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof SETTINGS_TABS)[number]['id']>('amenities');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">الإعدادات</h1>
          <p className="text-gray-500 font-medium">تبويبات واضحة للعرض: المزايا، المدراء، والإشعارات.</p>
        </div>
        <Badge variant="success" className="px-4 py-2 text-sm">جاهز للعرض</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'amenities' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">المزايا المفعلة</h2>
              <p className="text-sm text-gray-500 mt-1">قائمة ثابتة موضوعة للعرض التقديمي.</p>
            </div>
            <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />}>إضافة ميزة</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOCK_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <span className="font-medium text-gray-800">{amenity}</span>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'admins' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">المدراء</h2>
              <p className="text-sm text-gray-500 mt-1">كل الحسابات الإدارية في شاشة واحدة.</p>
            </div>
            <Badge variant="info">4 Accounts</Badge>
          </div>
          <div className="space-y-3">
            {[
              { name: 'محمد علي', role: 'Super Admin', status: 'active' },
              { name: 'سلمى فؤاد', role: 'Sales', status: 'active' },
              { name: 'أحمد حسن', role: 'Finance', status: 'pending' },
            ].map((admin) => (
              <div key={admin.name} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                <div>
                  <div className="font-bold text-gray-900">{admin.name}</div>
                  <div className="text-sm text-gray-500">{admin.role}</div>
                </div>
                <Badge variant={admin.status === 'active' ? 'success' : 'warning'}>{admin.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4"><Bell className="w-5 h-5 text-brand-600" /><h2 className="text-xl font-bold text-gray-900">الأولوية</h2></div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"><span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> إشعارات الحجوزات الجديدة</span><Badge variant="warning">On</Badge></div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"><span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500" /> إشعارات المراجعات</span><Badge variant="success">On</Badge></div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4"><UsersRound className="w-5 h-5 text-brand-600" /><h2 className="text-xl font-bold text-gray-900">حالة التنبيهات</h2></div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800 flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4" /> جميع القنوات التجريبية جاهزة للعرض</div>
              <div className="rounded-2xl bg-gray-50 p-4 text-gray-600">تذكير: هذا الديمو frontend-only بالكامل.</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}