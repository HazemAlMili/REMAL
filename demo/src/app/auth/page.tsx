import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

const CARDS = [
  {
    title: 'Admin Login',
    description: 'لوحة التحكم، CRM، المالية، والوحدات.',
    href: ROUTES.authAdminLogin,
    accent: 'from-brand-600 to-brand-500',
  },
  {
    title: 'Owner Login',
    description: 'بوابة المالك: الوحدات، التقويم، والأرباح.',
    href: ROUTES.authOwnerLogin,
    accent: 'from-emerald-600 to-teal-500',
  },
  {
    title: 'Client Login',
    description: 'حساب العميل للحجوزات والمتابعة.',
    href: ROUTES.authClientLogin,
    accent: 'from-accent-600 to-orange-500',
  },
];

export default function AuthHubPage() {
  return (
    <div className="w-full max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-premium backdrop-blur-xl sm:p-10">
          <div className="mb-8 inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700">
            دخول حسب الدور
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            اختار بوابة الدخول المناسبة
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            الصفحة دي بتفصل بين رحلة العميل، المالك، والإدارة. هي البداية الرسمية للديمو الكامل.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-3xl border border-gray-100 bg-gray-50 p-5 transition-all hover:-translate-y-1 hover:shadow-float"
              >
                <div className={`mb-4 h-2 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
                <h2 className="text-xl font-bold text-gray-900">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">{card.description}</p>
                <div className="mt-5 text-sm font-bold text-brand-700">افتح</div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-brand-100 bg-brand-950 p-8 text-white shadow-premium sm:p-10">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-300">Demo story</div>
          <h2 className="mt-4 text-3xl font-black leading-tight">
            Guest → CRM → Finance → Owner
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/70">
            الديمو هدفه يوري السلسلة الكاملة: اختيار وحدة، إنشاء lead، تأكيد الحجز، تسجيل الدفع، ثم رؤية الأثر في المالية وبوابة المالك.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">1. Public discovery and booking</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">2. Admin pipeline and payments</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">3. Owner visibility and payouts</div>
          </div>
        </aside>
      </div>
    </div>
  );
}