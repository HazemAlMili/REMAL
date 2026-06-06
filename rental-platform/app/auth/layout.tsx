export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-auth flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(20,23,26,0.06),0_12px_28px_rgba(20,23,26,0.07)] md:grid-cols-2">
        {/* Brand panel */}
        <aside className="flex flex-col bg-neutral-900 p-8 text-neutral-50 max-md:flex-row max-md:items-center max-md:gap-3 max-md:p-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-primary-500 text-lg font-bold tracking-tight text-white">
              R
            </div>
            <span className="text-xl font-semibold tracking-tight">Remal</span>
          </div>
          <p className="mt-auto max-w-[24ch] pt-6 text-[1.0625rem] font-medium leading-relaxed max-md:hidden">
            Bookings, payouts, and owners in one place.
          </p>
          <p className="mt-3 text-xs text-neutral-400 max-md:hidden">
            Property management platform
          </p>
        </aside>

        {/* Form panel */}
        <div className="flex flex-col justify-center bg-white p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
