"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Info,
  Loader2,
  LogIn,
  CalendarX,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { platformAuthUrl } from "@/lib/auth/platform";
import { useUnit, useUnitImages } from "@/lib/hooks/useCatalog";
import { bookingsService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/api-error";
import { getCoverImageUrl } from "@/lib/utils/image";
import { formatCurrency, getNights, parseDateOnly } from "@/lib/utils/format";

const PLATFORM_URL = (process.env.NEXT_PUBLIC_PLATFORM_URL ?? "").replace(/\/+$/, "");

function CheckoutContent() {
  const searchParams = useSearchParams();
  const unitId = searchParams.get("unitId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests") ?? "2";

  const { isAuthenticated, isReady } = useAuth();
  const { data: unit, isLoading } = useUnit(unitId);
  const images = useUnitImages(unitId);
  const cover = getCoverImageUrl(images);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const hasDates = Boolean(checkIn && checkOut);
  const nights =
    checkIn && checkOut
      ? getNights(parseDateOnly(checkIn), parseDateOnly(checkOut))
      : 0;
  const basePrice = unit?.basePricePerNight ?? 0;
  const subtotal = nights * basePrice;

  const fmt = (value: string | null) =>
    value ? format(parseDateOnly(value), "d MMM yyyy", { locale: ar }) : "—";

  const submitBooking = async () => {
    if (isSubmitting || !unitId || !checkIn || !checkOut) return;
    setIsSubmitting(true);
    try {
      await bookingsService.createOwn({
        unitId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: Number(guests) || 1,
      });
      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "تعذر إتمام الحجز. حاول مرة أخرى.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrimary = () => {
    if (!isAuthenticated) {
      window.location.assign(platformAuthUrl("login", window.location.href));
      return;
    }
    void submitBooking();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] pt-32 pb-20 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-2xl font-black text-brand-950 mb-3">الوحدة غير متاحة</h1>
          <p className="text-gray-500 mb-8">قد تكون الوحدة غير نشطة أو تم حذفها.</p>
          <Link href="/search">
            <span className="inline-flex rounded-xl bg-brand-950 px-8 py-4 font-bold text-white">
              تصفّح الوحدات
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9] pt-32 pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          href={`/units/${unit.id}`}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-950 mb-8 w-fit transition-colors font-bold"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة لتفاصيل الوحدة</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-brand-950 mb-3 tracking-tight">
            تأكيد طلب الحجز
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            راجع تفاصيل إقامتك ثم أرسل طلب الحجز ليتابعه فريقنا.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Details */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
              <h2 className="text-2xl font-black text-brand-950 mb-8">تفاصيل الإقامة</h2>

              {!hasDates ? (
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-amber-800">
                  <CalendarX className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">لم يتم اختيار التواريخ</p>
                    <p className="text-sm mt-1">
                      ارجع لصفحة الوحدة واختر تاريخ الوصول والمغادرة لإتمام الحجز.
                    </p>
                    <Link
                      href={`/units/${unit.id}`}
                      className="mt-3 inline-block font-bold underline"
                    >
                      اختيار التواريخ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-black text-gray-400 uppercase mb-2">الوصول</div>
                    <div className="text-lg font-bold text-brand-950 tabular-nums">{fmt(checkIn)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-400 uppercase mb-2">المغادرة</div>
                    <div className="text-lg font-bold text-brand-950 tabular-nums">{fmt(checkOut)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-400 uppercase mb-2">عدد الليالي</div>
                    <div className="text-lg font-bold text-brand-950 tabular-nums">{nights}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-400 uppercase mb-2">عدد الضيوف</div>
                    <div className="text-lg font-bold text-brand-950 tabular-nums">{guests}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
              <h2 className="text-2xl font-black text-brand-950 mb-6 flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" /> ماذا يحدث بعد الإرسال؟
              </h2>
              <p className="text-gray-500 leading-relaxed font-medium">
                يصل طلبك لفريق Kaza Booking كـ «طلب مبدئي». نراجع توفّر التاريخ،
                نرسل لك فيديو فعلي وتفاصيل السعر الرسمية، ونتابع معك خطوات تأكيد
                الحجز والعربون. لن يتم خصم أي مبلغ الآن.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 sticky top-32">
              <div className="flex gap-4 mb-8">
                {cover ? (
                  <img
                    src={cover}
                    alt={unit.name}
                    className="w-24 h-24 object-cover rounded-2xl shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-100 to-gray-100 shrink-0" />
                )}
                <div className="flex flex-col justify-center">
                  <div className="text-[10px] text-accent-600 font-black uppercase mb-1" dir="auto">
                    {unit.unitType}
                  </div>
                  <h3 className="font-black text-brand-950 leading-tight" dir="auto">
                    {unit.name}
                  </h3>
                </div>
              </div>

              {hasDates && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-brand-950 font-black text-sm">
                    <Info size={14} className="text-accent-500" /> تفاصيل السعر التقديرية
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium text-sm">
                    <span className="tabular-nums">
                      {formatCurrency(basePrice)} × {nights} ليالي
                    </span>
                    <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-black text-brand-950 pt-4 border-t border-gray-100 text-xl">
                    <span>الإجمالي التقديري</span>
                    <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              )}

              {isSuccess ? (
                <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-black text-brand-950 mb-1">تم استلام طلب حجزك!</p>
                  <p className="text-sm text-gray-500 mb-4">
                    يمكنك متابعة حالة الطلب من حسابك.
                  </p>
                  {PLATFORM_URL && (
                    <a
                      href={`${PLATFORM_URL}/account/bookings`}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-950 py-4 font-black text-white"
                    >
                      عرض حجوزاتي
                    </a>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePrimary}
                  disabled={!hasDates || isSubmitting || !isReady}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-950 py-5 text-lg font-black text-white shadow-lg transition-all enabled:hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> جارٍ إرسال الطلب…
                    </>
                  ) : !isReady ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> لحظة…
                    </>
                  ) : isAuthenticated ? (
                    <>تأكيد طلب الحجز</>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" /> سجّل الدخول لتأكيد الحجز
                    </>
                  )}
                </button>
              )}

              <a
                href="https://wa.me/201000082960"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" /> استفسار عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#F7F7F9] pt-32 pb-20" />}
    >
      <CheckoutContent />
    </Suspense>
  );
}
