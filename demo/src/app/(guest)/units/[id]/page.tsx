import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_UNITS, MOCK_AREAS } from '@/lib/mock-data';
import { UnitGallery } from '@/components/ui/UnitGallery';
import { UnitBookingWidget } from '@/components/ui/UnitBookingWidget';
import { 
  Star, MapPin, Users, BedDouble, Bath, Wifi, Waves, 
  ShieldCheck, Check, Calendar as CalendarIcon, ChevronRight, 
  PlayCircle, Share, Heart, Award, Shield, FileText, Info, Video
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function UnitDetailsPage({ params }: Props) {
  const { id } = await params;
  const unit = MOCK_UNITS.find(u => u.id === id);
  
  if (!unit) {
    notFound();
  }

  const area = MOCK_AREAS.find(a => a.id === unit.areaId);

  // Fallback images if unit doesn't have 5 images
  const images = unit.images?.length >= 5 ? unit.images : [
    unit.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
    unit.images?.[1] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    unit.images?.[2] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    unit.images?.[3] || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
    unit.images?.[4] || 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      
      {/* Title & Actions Section */}
      <div className="container mx-auto px-6 pt-40 pb-6">
        <h1 className="text-4xl md:text-5xl font-black text-brand-950 mb-4 tracking-tighter">{unit.name}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1 text-brand-950">
              <Star className="w-4 h-4 fill-brand-950 text-brand-950" />
              <span className="font-bold">{unit.rating || '4.9'}</span>
              <span className="text-gray-500 underline cursor-pointer hover:text-brand-950 transition-colors">({unit.reviewsCount || 12} تقييم)</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
              <span className="underline cursor-pointer hover:text-brand-950 transition-colors">{area?.name}، الساحل الشمالي</span>
            </div>
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

      {/* Premium 5-Image Masonry Gallery */}
      <div className="container mx-auto px-6 mb-12">
        <UnitGallery images={images} />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Host & High-level features */}
            <div className="flex justify-between items-center pb-8 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-brand-950 mb-2">مستضافة بواسطة {unit.owner?.name || 'Smar Host'}</h2>
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <span>حتى {unit.capacity} أفراد</span>
                  <span>•</span>
                  <span>{unit.bedrooms} غرف نوم</span>
                  <span>•</span>
                  <span>{unit.bathrooms} حمام</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-brand-950 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
                S
              </div>
            </div>

            {/* Smar Trust Pack Features */}
            <div className="bg-brand-50/50 p-8 rounded-2xl border border-brand-100 space-y-8 shadow-soft">
              <div className="flex items-center gap-3 pb-4 border-b border-brand-100/50">
                 <ShieldCheck className="w-6 h-6 text-brand-900" strokeWidth={1.5} />
                 <h3 className="text-xl font-black text-brand-950 tracking-tight">لماذا تحجز عبر Kaza Booking؟</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <Video className="w-5 h-5 text-brand-900" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-950 mb-1">فيديو فعلي قبل الحجز</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">نرسل لك فيديو حقيقي للوحدة لضمان مطابقتها للصور.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <FileText className="w-5 h-5 text-brand-900" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-950 mb-1">Trust Pack كامل</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">يشمل تفاصيل السعر، العربون، القواعد، وسياسة الإلغاء بوضوح.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-brand-950 mb-4">عن الوحدة</h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{unit.description}</p>
            </div>

            {/* Video Walkthrough (Real Tour) */}
            {unit.videoWalkthrough && (
              <div className="pb-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-brand-950 mb-6">جولة بالفيديو (Video Tour)</h2>
                <div className="relative aspect-video bg-brand-950 rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                  <img src={images[0]} className="w-full h-full object-cover opacity-60" alt="Video thumbnail" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 z-20">
                    <Badge className="bg-brand-950/80 text-white border-none text-sm px-4 py-1 font-bold">فيديو فعلي متاح لهذا العقار</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-brand-950 mb-6">المرافق ووسائل الراحة</h2>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                {unit.amenities.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-lg font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sticky Booking Widget (Right Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
               <UnitBookingWidget unitId={unit.id} basePrice={unit.basePrice} />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-brand-50 p-4 z-50 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe flex justify-between items-center">
        <div>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-black text-brand-950 tracking-tighter">EGP {unit.basePrice.toLocaleString()}</span>
             <span className="text-gray-500 text-[10px] font-bold">/ ليلة</span>
          </div>
          <div className="text-[10px] text-accent-600 font-extrabold uppercase tracking-widest mt-1">فيديو فعلي متاح</div>
        </div>
        <Link href={`/checkout?unitId=${unit.id}`}>
          <Button className="rounded-xl px-8 py-6 text-base bg-brand-950 text-white font-black shadow-premium">
             اطلب Trust Pack
          </Button>
        </Link>
      </div>

    </div>
  );
}
