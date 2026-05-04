"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/Button';
import { setDemoRoleCookie } from '@/lib/auth-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@kaza-booking.demo');
  const [password, setPassword] = useState('demo12345');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [returnTo, setReturnTo] = useState('');

  useEffect(() => {
    setReturnTo(new URLSearchParams(window.location.search).get('returnTo') || '');
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    window.setTimeout(() => {
      if (!email || !password) {
        setError('املأ البريد وكلمة المرور للدخول التجريبي.');
        setIsLoading(false);
        return;
      }

      setDemoRoleCookie('admin');
      router.push(returnTo || ROUTES.adminDashboard);
      router.refresh();
    }, 250);
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-8 shadow-premium sm:p-10">
      <div className="mb-6">
        <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Admin access</div>
        <h1 className="mt-3 text-3xl font-black text-gray-900">تسجيل دخول الإدارة</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">ادخل للـ CRM، المالية، والوحدات من هنا.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-medium text-gray-700">
          البريد الإلكتروني
          <input className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-colors focus:border-brand-500" value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label className="block space-y-2 text-sm font-medium text-gray-700">
          كلمة المرور
          <input className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-colors focus:border-brand-500" value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" className="w-full rounded-2xl" isLoading={isLoading}>
          دخول الإدارة
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <Link href={ROUTES.auth} className="font-semibold text-brand-700 hover:underline">اختيار دور آخر</Link>
      </div>
    </div>
  );
}