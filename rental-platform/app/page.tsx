import Link from "next/link";
import { 
  Check, 
  MapPin, 
  Home, 
  Users, 
  PlayCircle,
  FileCheck,
  ShieldCheck,
  ChevronDown,
  ArrowLeft
} from "lucide-react";

export default function SmarHomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F4EF] text-[#071321] font-sans">
      {/* 1. NAVBAR */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-2xl bg-white/70 backdrop-blur-md border border-white/20 shadow-sm transition-all">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold tracking-tight text-[#071321]">
            سمار
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-blue-900 transition-colors">الرئيسية</Link>
            <Link href="#" className="hover:text-blue-900 transition-colors">المناطق</Link>
            <Link href="#" className="hover:text-blue-900 transition-colors">إزاي بنشتغل</Link>
            <Link href="#" className="hover:text-blue-900 transition-colors">الأسئلة الشائعة</Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hidden sm:inline-flex px-4 py-2 text-sm text-[#071321] hover:bg-black/5 rounded-full transition-all">واتساب</a>
            <button className="bg-[#071321] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#102033] shadow-lg shadow-black/10 transition-all">
              رشّحلي وحدة
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#071321]/90 via-[#071321]/40 to-black/20 z-10" />
          <div className="absolute inset-0 bg-[#0B1623] z-0" />
          <video 
            autoPlay muted loop playsInline
            className="w-full h-full object-cover z-0 opacity-80"
            src="https://cdn.coverr.co/videos/coverr-waves-crashing-on-the-beach-4371/1080p.mp4" 
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm mb-6">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>إقامات موثقة ومُختارة</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            وحدات مختارة في العلمين والساحل،<br className="hidden md:block"/> تشوفها بفيديو فعلي قبل الحجز.
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            ابعت تاريخك وعدد الأفراد وميزانيتك، وسمار ترشح لك 2–3 وحدات مناسبة من اختيارات موثقة للكابلز والعائلات الصغيرة.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#071321] rounded-full text-lg font-bold hover:bg-gray-100 shadow-xl transition-transform hover:-translate-y-1">
              رشّحلي وحدة مناسبة
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-lg font-medium hover:bg-white/30 shadow-xl transition-all flex items-center justify-center gap-2">
              تواصل واتساب
            </button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-8 text-white/80 text-sm md:text-base font-medium">
            <div className="flex items-center gap-2"><PlayCircle className="w-5 h-5"/> فيديو فعلي للوحدة</div>
            <div className="flex items-center gap-2"><FileCheck className="w-5 h-5"/> تفاصيل السعر قبل العربون</div>
            <div className="flex items-center gap-2"><Check className="w-5 h-5"/> ترشيحات حسب رحلتك</div>
          </div>
        </div>
      </section>

      {/* 3. QUICK QUALIFICATION FORM */}
      <section className="py-24 px-4 bg-[#FAF8F4]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#071321] mb-4">خلينا نرشحلك الوحدة الأنسب</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              جاوب على كام سؤال بسيط، ونبعتلك أفضل 2–3 اختيارات مناسبة لتاريخك وميزانيتك.
            </p>
          </div>
          
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 border border-gray-100">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">الاسم</label>
                <input type="text" className="w-full p-4 bg-[#F7F4EF]/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#071321] outline-none transition-all" placeholder="الاسم الكريم" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">رقم الموبايل / واتساب</label>
                <input type="tel" className="w-full p-4 bg-[#F7F4EF]/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#071321] outline-none transition-all" placeholder="+20 10X XXX XXXX" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">تاريخ الوصول - الخروج (تقريبي)</label>
                <input type="text" className="w-full p-4 bg-[#F7F4EF]/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#071321] outline-none transition-all" placeholder="مثال: ١٤ يوليو - ١٨ يوليو" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">عدد الأفراد</label>
                <input type="number" className="w-full p-4 bg-[#F7F4EF]/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#071321] outline-none transition-all" placeholder="2 بالغين، 1 طفل" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">نوع الرحلة</label>
                <select className="w-full p-4 bg-[#F7F4EF]/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#071321] outline-none transition-all text-gray-700">
                  <option>كابل / هاني مون</option>
                  <option>عائلة صغيرة</option>
                  <option>مجموعة أصدقاء (سيدات)</option>
                  <option>غيره</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">المنطقة المفضلة</label>
                <select className="w-full p-4 bg-[#F7F4EF]/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#071321] outline-none transition-all text-gray-700">
                  <option>أبراج العلمين</option>
                  <option>مزارين</option>
                  <option>ذا جيت</option>
                  <option>بالم هيلز</option>
                  <option>مش محدد - اقترح لي</option>
                </select>
              </div>
              
              <div className="md:col-span-2 pt-6">
                <button type="submit" className="w-full p-5 bg-[#071321] text-white rounded-xl text-lg font-bold hover:bg-[#102033] shadow-lg shadow-black/10 transition-all flex justify-center items-center gap-3">
                  ابعتلي الترشيحات المناسبة
                  <ArrowLeft className="w-5 h-5"/>
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  مش طلب حجز نهائي — هنرشحلك الأنسب الأول
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 4. TRUST BLOCKS */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#071321] mb-4">قبل أي عربون، لازم تشوف التفاصيل بوضوح</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: PlayCircle, title: "فيديو فعلي", desc: "شوف نفس الوحدة اللي هتحجزها، مش صور عامة أو قديمة." },
              { icon: FileCheck, title: "تفاصيل السعر", desc: "نوضح السعر، العربون، وأي رسوم أو تأمين إن وجد قبل تأكيد الحجز." },
              { icon: ShieldCheck, title: "قواعد واضحة", desc: "عدد الأفراد، check-in/out، وسياسة الإلغاء حسب كل وحدة." },
              { icon: Check, title: "ترشيح مناسب", desc: "مش هنبعتلك 20 اختيار؛ هنرشحلك الأنسب حسب تاريخك وميزانيتك." }
            ].map((block, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#F7F4EF]/50 border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#071321] mb-6 shadow-sm">
                  <block.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#071321] mb-3">{block.title}</h3>
                <p className="text-gray-600 leading-relaxed">{block.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED AREAS */}
      <section className="py-24 px-4 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-[#071321] mb-4">اختيارات في أهم مناطق العلمين والساحل</h2>
              <p className="text-lg text-gray-600">نرشح لك وحدات حسب تاريخك وميزانيتك من مناطق مختارة.</p>
            </div>
            <button className="hidden md:block font-semibold text-[#071321] border-b-2 border-[#071321] pb-1">عرض كل المناطق</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "أبراج العلمين", for: "كابلز • هاني مون • Premium", img: "https://images.unsplash.com/photo-1544244015-0df2b7dce558?q=80&w=600&auto=format&fit=crop" },
              { name: "مزارين", for: "عائلات صغيرة • إقامة هادئة", img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600&auto=format&fit=crop" },
              { name: "ذا جيت", for: "Premium stays • Couples", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop" },
              { name: "بالم هيلز", for: "Families • Chalets", img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600&auto=format&fit=crop" }
            ].map((area, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm shadow-black/5 aspect-[4/5]">
                <img src={area.img} alt={area.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 w-full p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{area.name}</h3>
                  <p className="text-sm text-white/80 mb-4">{area.for}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold pb-1 border-b border-white/40 group-hover:border-white transition-colors">
                    شوف المتاح <ArrowLeft className="w-4 h-4"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="bg-[#071321] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h4 className="text-2xl font-bold mb-4">سمار</h4>
            <p className="text-white/70 max-w-sm leading-relaxed mb-6">
              خدمة ترشيح وحجز إقامات مختارة في العلمين والساحل، تساعدك تشوف الوحدة بفيديو فعلي وتعرف تفاصيلها قبل الحجز.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-4">روابط سريعة</h5>
            <ul className="space-y-3 text-white/70">
              <li><Link href="#">الرئيسية</Link></li>
              <li><Link href="#">إزاي بنشتغل</Link></li>
              <li><Link href="#">الأسئلة الشائعة</Link></li>
              <li><Link href="#">شروط الحجز</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">تواصل معنا</h5>
            <ul className="space-y-3 text-white/70">
              <li>واتساب: 01012345678</li>
              <li>انستجرام: smar.stays</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
