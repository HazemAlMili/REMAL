"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_UNITS, MOCK_AREAS } from '@/lib/mock-data';
import { Star, Plus, Search, SlidersHorizontal, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function UnitsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  const filtered = MOCK_UNITS.filter(u =>
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.owner.name.includes(searchTerm)) &&
    (areaFilter === '' || u.areaId === areaFilter)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-black text-brand-950 mb-1">الوحدات العقارية</h1>
          <p className="text-gray-500 text-sm font-medium">
            {filtered.length} وحدة · إجمالي الوحدات {MOCK_UNITS.length}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            المناطق
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-950 text-white text-sm font-bold hover:bg-brand-800 transition-all shadow-md hover:scale-105">
            <Plus className="w-4 h-4" />
            إضافة وحدة
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث باسم الوحدة أو المالك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 pr-11 py-2.5 text-sm outline-none focus:border-brand-950 focus:ring-2 focus:ring-brand-950/10 transition-all shadow-sm font-medium placeholder:text-gray-400"
          />
        </div>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-700 min-w-[180px] shadow-sm font-medium focus:border-brand-950 transition-all appearance-none"
        >
          <option value="">كل المناطق</option>
          {MOCK_AREAS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-700 min-w-[140px] shadow-sm font-medium focus:border-brand-950 transition-all appearance-none">
          <option>كل الحالات</option>
          <option>مفعلة</option>
          <option>محجوبة</option>
        </select>
      </div>

      {/* Premium Borderless Table */}
      <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">الوحدة</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">النوع / المنطقة</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">المالك</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">السعر</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">التقييم</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((unit, idx) => (
              <tr
                key={unit.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer group"
              >
                {/* Unit name + thumbnail */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={unit.images[0]}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 group-hover:scale-105 transition-transform duration-200"
                        alt={unit.name}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-brand-950 text-sm leading-tight">{unit.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{unit.bedrooms} غرف · {unit.bathrooms} حمام</p>
                    </div>
                  </div>
                </td>

                {/* Type / Area */}
                <td className="px-6 py-4 hidden md:table-cell">
                  <p className="font-semibold text-sm text-gray-700">{unit.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{MOCK_AREAS.find(a => a.id === unit.areaId)?.name}</p>
                </td>

                {/* Owner */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-brand-950 font-black text-xs shrink-0">
                      {unit.owner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-700">{unit.owner.name}</p>
                      <p className="text-xs text-gray-400">{unit.owner.phone}</p>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4">
                  <p className="font-black text-brand-950 text-sm">EGP {unit.basePrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">/ ليلة</p>
                </td>

                {/* Rating */}
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-sm text-brand-950">{unit.rating || '4.9'}</span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <Badge variant={unit.status === 'active' ? 'success' : 'warning'} className="font-bold text-xs">
                    {unit.status === 'active' ? '● مفعلة' : '● محجوبة'}
                  </Badge>
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-center">
                  <button className="p-2 rounded-xl text-gray-400 hover:text-brand-950 hover:bg-gray-100 transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">🏠</div>
                    <p className="font-bold text-gray-500">لم يتم العثور على وحدات</p>
                    <p className="text-sm text-gray-400">جرب تغيير معايير البحث</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-400 font-medium">عرض {filtered.length} من {MOCK_UNITS.length} وحدة</p>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === 1 ? 'bg-brand-950 text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}