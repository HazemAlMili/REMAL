"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/Button';
import { setDemoRoleCookie } from '@/lib/auth-client';

export default function OwnerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('01000000000');
  const [password, setPassword] = useState('demo12345');
  const [isLoading, setIsLoading] = useState(false);
  const [returnTo, setReturnTo] = useState('');

  useEffect(() => {
    setReturnTo(new URLSearchParams(window.location.search).get('returnTo') || '');
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    window.setTimeout(() => {
      setDemoRoleCookie('owner');
      router.push(returnTo || ROUTES.ownerDashboard);
      router.refresh();
    }, 250);
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-8 shadow-premium sm:p-10">
      <div className="mb-6">
        <div className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">Owner access</div>
        <h1 className="mt-3 text-3xl font-black text-gray-900">تسجيل دخول المالك</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">واجهة عرض فقط للوحدات، التقويم، والأرباح.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-medium text-gray-700">
          رقم الهاتف
          <input className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-colors focus:border-brand-500" value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" />
        </label>
        <label className="block space-y-2 text-sm font-medium text-gray-700">
          كلمة المرور
          <input className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-colors focus:border-brand-500" value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>

        <Button type="submit" variant="primary" size="lg" className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700" isLoading={isLoading}>
          دخول المالك
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <Link href={ROUTES.auth} className="font-semibold text-brand-700 hover:underline">اختيار دور آخر</Link>
      </div>
    </div>
  );
}