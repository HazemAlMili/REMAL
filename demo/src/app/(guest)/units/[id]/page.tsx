import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unitsService } from "@/lib/api/services";
import { getImageUrls } from "@/lib/utils/image";
import { formatCurrency } from "@/lib/utils/format";
import { UnitGallery } from "@/components/ui/UnitGallery";
import { UnitBookingWidget } from "@/components/ui/UnitBookingWidget";
import type { UnitDetails, UnitImage } from "@/lib/api/types";
import {
  MapPin,
  ShieldCheck,
  Video,
  FileText,
  Share,
  Heart,
} from "lucide-react";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function UnitDetailsPage({ params }: Props) {
  const { id } = await params;

  let unit: UnitDetails | null = null;
  try {
    unit = await unitsService.getById(id);
  } catch {
    unit = null;
  }
  if (!unit) {
    notFound();
  }

  let images: UnitImage[] = [];
  try {
    images = await unitsService.getImages(id);
  } catch {
    images = [];
  }
  const imageUrls = getImageUrls(images);

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Title & Actions */}
      <div className="container mx-auto px-6 pt-40 pb-6">
        <h1
          dir="auto"
          className="text-4xl md:text-5xl font-black text-brand-950 mb-4 tracking-tighter"
        >
          {unit.name}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <MapPin className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
            <span dir="auto">{unit.projectName}، الساحل الشمالي</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors text-sm">
              <Share className="w-4 h-4" strokeWidth={1.5} /> شارك
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors text-sm">
              <Heart className="w-4 h-4" strokeWidth={1.5} /> احفظ
            </button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-6 mb-12">
        {imageUrls.length > 0 ? (
          <UnitGallery images={imageUrls} />
        ) : (
          <div className="h-[300px] md:h-[500px] w-full rounded-2xl bg-gradient-to-br from-brand-100 via-brand-50 to-gray-100 flex items-center justify-center">
            <span className="text-brand-300 font-black text-3xl tracking-tighter">
              Kaza Booking
            </span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            {/* Host & high-level features */}
            <div className="flex justify-between items-center pb-8 border-b border-gray-100">
              <div>
                <h2
                  dir="auto"
                  className="text-2xl font-bold text-brand-950 mb-2"
                >
                  مستضافة بواسطة {unit.ownerName}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <span>حتى {unit.maxGuests} أفراد</span>
                  <span>•</span>
                  <span>{unit.bedrooms} غرف نوم</span>
                  <span>•</span>
                  <span>{unit.bathrooms} حمام</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-brand-950 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
                K
              </div>
            </div>

            {/* Trust Pack */}
            <div className="bg-brand-50/50 p-8 rounded-2xl border border-brand-100 space-y-8 shadow-soft">
              <div className="flex items-center gap-3 pb-4 border-b border-brand-100/50">
                <ShieldCheck className="w-6 h-6 text-brand-900" strokeWidth={1.5} />
                <h3 className="text-xl font-black text-brand-950 tracking-tight">
                  لماذا تحجز عبر Kaza Booking؟
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <Video className="w-5 h-5 text-brand-900" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-950 mb-1">
                      فيديو فعلي قبل الحجز
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      نرسل لك فيديو حقيقي للوحدة لضمان مطابقتها للصور.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <FileText className="w-5 h-5 text-brand-900" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-950 mb-1">
                      Trust Pack كامل
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      يشمل تفاصيل السعر، العربون، القواعد، وسياسة الإلغاء بوضوح.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {unit.description && (
              <div className="pb-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-brand-950 mb-4">
                  عن الوحدة
                </h2>
                <p
                  dir="auto"
                  className="text-gray-600 leading-relaxed text-lg whitespace-pre-line"
                >
                  {unit.description}
                </p>
              </div>
            )}
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <UnitBookingWidget
                unitId={unit.id}
                unitName={unit.name}
                basePrice={unit.basePricePerNight}
                maxGuests={unit.maxGuests}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-brand-50 p-4 z-50 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe flex justify-between items-center">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-brand-950 tracking-tighter tabular-nums">
              {formatCurrency(unit.basePricePerNight)}
            </span>
            <span className="text-gray-500 text-[10px] font-bold">/ ليلة</span>
          </div>
          <div className="text-[10px] text-accent-600 font-extrabold uppercase tracking-widest mt-1">
            احجز من القائمة
          </div>
        </div>
        <Link href={`/checkout?unitId=${unit.id}`}>
          <span className="inline-flex items-center rounded-xl px-8 py-4 text-base bg-brand-950 text-white font-black shadow-premium">
            احجز الآن
          </span>
        </Link>
      </div>
    </div>
  );
}
