export const MOCK_AREAS = [
  {
    id: "a1",
    name: "أبراج العلمين (North Edge)",
    description: "إقامة راقية في قلب أبراج العلمين، خصوصية للكابلز وإطلالات بانورامية.",
    imageUrl: "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?q=80&w=2070&auto=format&fit=crop",
    unitsCount: 12,
    status: "active"
  },
  {
    id: "a2",
    name: "مزارين (Mazarine)",
    description: "فيلات وشاليهات واسعة مثالية للعائلات الصغيرة التي تبحث عن الراحة والهدوء.",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
    unitsCount: 18,
    status: "active"
  },
  {
    id: "a3",
    name: "ذا جيت (The Gate)",
    description: "أعلى معايير الرفاهية والـ Premium stays في الساحل الشمالي.",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop",
    unitsCount: 5,
    status: "active"
  },
  {
    id: "a4",
    name: "بالم هيلز العلمين",
    description: "مجتمع متكامل يجمع بين مساحات اللاندسكيب والهدوء المطلق.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    unitsCount: 8,
    status: "active"
  }
];

export const MOCK_UNITS = [
  // Couples / Honeymoon
  {
    id: "u1",
    areaId: "a1",
    name: "ستوديو كلاود ناين - بانوراما البحر",
    type: "ستوديو",
    capacity: 2,
    basePrice: 6500,
    status: "active",
    owner: { name: "أحمد منصور", phone: "010xxxxxxx" },
    bedrooms: 1,
    bathrooms: 1,
    description: "ستوديو مصمم خصيصاً للهاني مون، إطلالة مباشرة على البحر بدون أي مجروحات، خصوصية تامة.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1de24244b7?q=80&w=1980&auto=format&fit=crop"
    ],
    videoWalkthrough: "https://example.com/video1",
    amenities: ["جاكوزي داخلي", "إطلالة بانورامية", "سمارت هوم", "واي فاي 5G", "خصوصية تامة"],
    rating: 4.9,
    reviewsCount: 24,
    category: "couples"
  },
  {
    id: "u2",
    areaId: "a1",
    name: "شاليه سكاي إيدج - الدور 32",
    type: "شاليه",
    capacity: 2,
    basePrice: 7000,
    status: "active",
    owner: { name: "سارة رمزي", phone: "012xxxxxxx" },
    bedrooms: 1,
    bathrooms: 1,
    description: "إقامة هادية للكابلز في أبراج العلمين، تشطيب فاخر ومطبخ مجهز بالكامل مع إطلالة لا تحجب.",
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
    ],
    amenities: ["إطلالة على البحر", "سمارت تي في", "تكييف مركزي"],
    rating: 4.8,
    reviewsCount: 16,
    category: "couples"
  },
  // Small Families
  {
    id: "u3",
    areaId: "a2",
    name: "فيلا مزارين العائلية - جاردن فيو",
    type: "فيلا",
    capacity: 5,
    basePrice: 12000,
    status: "active",
    owner: { name: "محمد كمال", phone: "011xxxxxxx" },
    bedrooms: 3,
    bathrooms: 3,
    description: "فيلا مناسبة جداً لعائلة صغيرة، حديقة خاصة مغلقة آمنة للأطفال، على بُعد دقيقتين من الشاطئ الرئيسي.",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
    ],
    videoWalkthrough: "https://example.com/video2",
    amenities: ["حديقة خاصة مغلقة", "آمنة للأطفال", "قريبة من الشاطئ", "منطقة شواء", "واي فاي"],
    rating: 4.7,
    reviewsCount: 32,
    category: "families"
  },
  {
    id: "u4",
    areaId: "a4",
    name: "شاليه بالم هيلز المزدوج",
    type: "شاليه",
    capacity: 4,
    basePrice: 10500,
    status: "active",
    owner: { name: "نور الدين", phone: "010xxxxxxx" },
    bedrooms: 2,
    bathrooms: 2,
    description: "شاليه واسع للعائلات، تصميم مريح وقريب من الخدمات وحمامات السباحة، مثالي لمصيف بدون مفاجآت.",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop"
    ],
    amenities: ["حمام سباحة مشترك", "قريب من الخدمات", "تجهيزات عائلية", "مطبخ متكامل"],
    rating: 4.8,
    reviewsCount: 15,
    category: "families"
  },
  // Premium
  {
    id: "u5",
    areaId: "a3",
    name: "بنتهاوس ذا جيت - الرفاهية المطلقة",
    type: "بنتهاوس",
    capacity: 6,
    basePrice: 25000,
    status: "active",
    owner: { name: "شركة ريادة", phone: "012xxxxxxx" },
    bedrooms: 4,
    bathrooms: 5,
    description: "للباحثين عن الـ Premium، بنتهاوس بمسبح خاص بإنفينيتي يطل على أبراج العلمين والبحر. تشطيبات فندقية وتجربة لا تُنسى.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop"
    ],
    videoWalkthrough: "https://example.com/video3",
    amenities: ["مسبح خاص", "خادمة يومية", "مدخل خاص", "مصعد مباشر", "جاكوزي"],
    rating: 5.0,
    reviewsCount: 9,
    category: "premium"
  },
  {
    id: "u6",
    areaId: "a1",
    name: "فيلا أبراج النخبة - VIP",
    type: "فيلا",
    capacity: 4,
    basePrice: 18000,
    status: "active",
    owner: { name: "أحمد منصور", phone: "010xxxxxxx" },
    bedrooms: 2,
    bathrooms: 3,
    description: "فيلا بمواصفات الـ VIP، إطلالة استثنائية مع خدمة فندقية 5 نجوم.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
    ],
    amenities: ["خدمة فندقية", "أثاث إيطالي", "إطلالة مزدوجة", "كلوب هاوس"],
    rating: 4.9,
    reviewsCount: 11,
    category: "premium"
  }
];

export const MOCK_BOOKINGS = [
  { id: 'bk-1001', client: 'أحمد يونس', phone: '01012345678', unitId: 'u1', areaId: 'a1', status: 'booked', source: 'Checkout', checkIn: '20 يوليو 2026', checkOut: '25 يوليو 2026', nights: 5, guests: 2, total: 32500, ownerNet: 26000 },
  { id: 'bk-1002', client: 'نورهان سعيد', phone: '01019283746', unitId: 'u3', areaId: 'a2', status: 'confirmed', source: 'Website', checkIn: '28 يوليو 2026', checkOut: '31 يوليو 2026', nights: 3, guests: 4, total: 36000, ownerNet: 28800 },
  { id: 'bk-1003', client: 'أحمد ربيع', phone: '01519283746', unitId: 'u5', areaId: 'a3', status: 'completed', source: 'Referral', checkIn: '12 يونيو 2026', checkOut: '15 يونيو 2026', nights: 3, guests: 6, total: 75000, ownerNet: 60000 },
];

export const MOCK_CLIENTS = [
  { id: 'cl-1', name: 'أحمد يونس', phone: '01012345678', email: 'ahmed@demo.com', bookingsCount: 2, lastBooking: '20 يوليو 2026', status: 'vip' },
  { id: 'cl-2', name: 'نورهان سعيد', phone: '01019283746', email: 'nourhan@demo.com', bookingsCount: 1, lastBooking: '28 يوليو 2026', status: 'active' },
  { id: 'cl-3', name: 'سارة خالد', phone: '01199887766', email: 'sara@demo.com', bookingsCount: 3, lastBooking: '30 يونيو 2026', status: 'repeat' },
];

export const MOCK_OWNERS = [
  { id: 'ow-1', name: 'أحمد منصور', phone: '010xxxxxxx', commissionRate: 20, unitCount: 2, status: 'active', payoutStatus: 'ready' },
  { id: 'ow-2', name: 'شركة ريادة', phone: '012xxxxxxx', commissionRate: 15, unitCount: 5, status: 'active', payoutStatus: 'paid' },
  { id: 'ow-3', name: 'محمد كمال', phone: '011xxxxxxx', commissionRate: 18, unitCount: 1, status: 'active', payoutStatus: 'ready' },
];

export const MOCK_REVIEWS = [
  { id: 'rv-1', client: 'أحمد ربيع', unit: 'بنتهاوس ذا جيت - الرفاهية المطلقة', rating: 5, comment: 'خدمة ممتازة وتجربة سلسة من أول استفسار للحجز، الوحدة مطابقة للفيديو تماماً.', status: 'published', date: '2 مايو 2026' },
  { id: 'rv-2', client: 'نورهان سعيد', unit: 'ستوديو كلاود ناين', rating: 5, comment: 'مكان رائع للهاني مون، خصوصية تامة وإطلالة مذهلة.', status: 'pending', date: '1 مايو 2026' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'nt-1', title: 'حجز جديد من أحمد يونس', description: 'تم تأكيد حجز ستوديو كلاود ناين.', time: 'منذ 5 دقائق', unread: true, type: 'booking' },
  { id: 'nt-2', title: 'مراجعة جديدة بإنتظار المراجعة', description: 'راجع تقييم نورهان سعيد قبل النشر.', time: 'منذ 42 دقيقة', unread: true, type: 'review' },
  { id: 'nt-3', title: 'دفعة مالك جاهزة', description: 'أرباح أحمد منصور متاحة للتحويل هذا الأسبوع.', time: 'منذ 2 ساعة', unread: false, type: 'finance' },
];

export const MOCK_AMENITIES = [
  'مسبح خاص',
  'مسبح بإنفينيتي',
  'كلوب هاوس',
  'موقف سيارات ذكي',
  'واي فاي 5G',
  'صالة رياضية',
  'خدمة تنظيف يومية',
  'إطلالة على البحر',
  'جاكوزي داخلي',
  'حديقة خاصة',
];
