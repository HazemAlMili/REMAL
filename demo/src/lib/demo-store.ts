export type DemoLeadStatus = 'prospecting' | 'relevant' | 'booked' | 'confirmed';

export type DemoLead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'Website' | 'WhatsApp' | 'Instagram' | 'Checkout';
  unitId: string;
  days: number;
  status: DemoLeadStatus;
  createdAt: string;
  bookingRef?: string;
};

export type DemoBooking = {
  id: string;
  bookingRef: string;
  leadId: string;
  unitId: string;
  unitName: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  nights: number;
  totalAmount: number;
  status: DemoLeadStatus;
  createdAt: string;
};

const LEADS_KEY = 'kaza_demo_leads';
const BOOKINGS_KEY = 'kaza_demo_bookings';

function readJsonArray<T>(key: string): T[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string) {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${randomPart}`;
}

export function loadDemoLeads() {
  return readJsonArray<DemoLead>(LEADS_KEY);
}

export function loadDemoBookings() {
  return readJsonArray<DemoBooking>(BOOKINGS_KEY);
}

export function createDemoBooking(input: {
  unitId: string;
  unitName: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  nights: number;
  totalAmount: number;
}) {
  const bookingRef = `RB-${String(Date.now()).slice(-6)}`;
  const leadId = createId('lead');
  const bookingId = createId('booking');
  const createdAt = new Date().toISOString();

  const lead: DemoLead = {
    id: leadId,
    name: input.guestName,
    phone: input.guestPhone,
    email: input.guestEmail,
    source: 'Checkout',
    unitId: input.unitId,
    days: 0,
    status: 'booked',
    createdAt,
    bookingRef,
  };

  const booking: DemoBooking = {
    id: bookingId,
    bookingRef,
    leadId,
    unitId: input.unitId,
    unitName: input.unitName,
    guestName: input.guestName,
    guestPhone: input.guestPhone,
    guestEmail: input.guestEmail,
    nights: input.nights,
    totalAmount: input.totalAmount,
    status: 'booked',
    createdAt,
  };

  const nextLeads = [lead, ...loadDemoLeads().filter((item) => item.bookingRef !== bookingRef)];
  const nextBookings = [booking, ...loadDemoBookings().filter((item) => item.bookingRef !== bookingRef)];

  writeJsonArray(LEADS_KEY, nextLeads);
  writeJsonArray(BOOKINGS_KEY, nextBookings);

  return { lead, booking };
}
