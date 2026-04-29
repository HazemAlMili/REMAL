export const queryKeys = {
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ AREAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  areas: {
    all: ['areas'] as const,
    list: () => [...queryKeys.areas.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.areas.all, 'detail', id] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ UNITS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  units: {
    all: ['units'] as const,
    publicList: (filters?: object) => [...queryKeys.units.all, 'public', 'list', filters ?? {}] as const,
    publicDetail: (id: string) => [...queryKeys.units.all, 'public', 'detail', id] as const,
    internalList: (filters?: object) => [...queryKeys.units.all, 'internal', 'list', filters ?? {}] as const,
    internalDetail: (id: string) => [...queryKeys.units.all, 'internal', 'detail', id] as const,
    images: (unitId: string) => [...queryKeys.units.all, unitId, 'images'] as const,
    amenities: (unitId: string) => [...queryKeys.units.all, unitId, 'amenities'] as const,
    seasonalPricing: (unitId: string) => [...queryKeys.units.all, unitId, 'seasonal-pricing'] as const,
    dateBlocks: (unitId: string) => [...queryKeys.units.all, unitId, 'date-blocks'] as const,
    availability: (unitId: string, range?: object) => [...queryKeys.units.all, unitId, 'availability', range ?? {}] as const,
    pricing: (unitId: string, range?: object) => [...queryKeys.units.all, unitId, 'pricing', range ?? {}] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ AMENITIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  amenities: {
    all: ['amenities'] as const,
    list: () => [...queryKeys.amenities.all, 'list'] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ BOOKINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  bookings: {
    all: ['bookings'] as const,
    list: (filters?: object) => [...queryKeys.bookings.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.bookings.all, 'detail', id] as const,
    statusHistory: (id: string) => [...queryKeys.bookings.all, id, 'status-history'] as const,
    notes: (id: string) => [...queryKeys.bookings.all, id, 'notes'] as const,
    assignment: (id: string) => [...queryKeys.bookings.all, id, 'assignment'] as const,
    financeSnapshot: (id: string) => [...queryKeys.bookings.all, id, 'finance-snapshot'] as const,
    payments: (id: string) => [...queryKeys.bookings.all, id, 'payments'] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CRM LEADS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  crm: {
    all: ['crm'] as const,
    leads: (filters?: object) => [...queryKeys.crm.all, 'leads', filters ?? {}] as const,
    leadDetail: (id: string) => [...queryKeys.crm.all, 'lead', id] as const,
    leadNotes: (leadId: string) => [...queryKeys.crm.all, leadId, 'notes'] as const,
    leadAssignment: (leadId: string) => [...queryKeys.crm.all, leadId, 'assignment'] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ OWNERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  owners: {
    all: ['owners'] as const,
    list: (filters?: object) => [...queryKeys.owners.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.owners.all, 'detail', id] as const,
    payouts: (id: string) => [...queryKeys.owners.all, id, 'payouts'] as const,
    payoutSummary: (id: string) => [...queryKeys.owners.all, id, 'payout-summary'] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CLIENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  clients: {
    all: ['clients'] as const,
    list: (filters?: object) => [...queryKeys.clients.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.clients.all, 'detail', id] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PAYMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  payments: {
    all: ['payments'] as const,
    list: (filters?: object) => [...queryKeys.payments.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.payments.all, 'detail', id] as const,
    byBooking: (bookingId: string) => [...queryKeys.payments.all, 'booking', bookingId] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ INVOICES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  invoices: {
    all: ['invoices'] as const,
    list: (filters?: object) => [...queryKeys.invoices.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.invoices.all, 'detail', id] as const,
    balance: (id: string) => [...queryKeys.invoices.all, id, 'balance'] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ OWNER PAYOUTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ownerPayouts: {
    all: ['owner-payouts'] as const,
    byOwner: (ownerId: string) => [...queryKeys.ownerPayouts.all, 'owner', ownerId] as const,
    byBooking: (bookingId: string) => [...queryKeys.ownerPayouts.all, 'booking', bookingId] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ REPORTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  reports: {
    all: ['reports'] as const,
    bookingsSummary: (filters?: object) => [...queryKeys.reports.all, 'bookings', 'summary', filters ?? {}] as const,
    bookingsDaily: (filters?: object) => [...queryKeys.reports.all, 'bookings', 'daily', filters ?? {}] as const,
    financeSummary: (filters?: object) => [...queryKeys.reports.all, 'finance', 'summary', filters ?? {}] as const,
    financeDaily: (filters?: object) => [...queryKeys.reports.all, 'finance', 'daily', filters ?? {}] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ REVIEWS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  reviews: {
    all: ['reviews'] as const,
    publicByUnit: (unitId: string, filters?: object) => [...queryKeys.reviews.all, 'public', unitId, filters ?? {}] as const,
    publicByUnitSummary: (unitId: string) => [...queryKeys.reviews.all, 'public', unitId, 'summary'] as const,
    moderationList: (filters?: object) => [...queryKeys.reviews.all, 'moderation', filters ?? {}] as const,
    statusHistory: (reviewId: string) => [...queryKeys.reviews.all, reviewId, 'status-history'] as const,
    byBooking: (bookingId: string) => [...queryKeys.reviews.all, 'booking', bookingId] as const,
    reply: (reviewId: string) => [...queryKeys.reviews.all, reviewId, 'reply'] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  notifications: {
    all: ['notifications'] as const,
    adminInbox: () => [...queryKeys.notifications.all, 'admin', 'inbox'] as const,
    adminInboxSummary: () => [...queryKeys.notifications.all, 'admin', 'inbox', 'summary'] as const,
    clientInbox: () => [...queryKeys.notifications.all, 'client', 'inbox'] as const,
    clientInboxSummary: () => [...queryKeys.notifications.all, 'client', 'inbox', 'summary'] as const,
    ownerInbox: () => [...queryKeys.notifications.all, 'owner', 'inbox'] as const,
    ownerInboxSummary: () => [...queryKeys.notifications.all, 'owner', 'inbox', 'summary'] as const,
    adminPreferences: () => [...queryKeys.notifications.all, 'admin', 'preferences'] as const,
    clientPreferences: () => [...queryKeys.notifications.all, 'client', 'preferences'] as const,
    ownerPreferences: () => [...queryKeys.notifications.all, 'owner', 'preferences'] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ OWNER PORTAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ownerPortal: {
    all: ['owner-portal'] as const,
    dashboard: () => [...queryKeys.ownerPortal.all, 'dashboard'] as const,
    units: () => [...queryKeys.ownerPortal.all, 'units'] as const,
    unitDetail: (unitId: string) => [...queryKeys.ownerPortal.all, 'unit', unitId] as const,
    bookings: () => [...queryKeys.ownerPortal.all, 'bookings'] as const,
    bookingDetail: (id: string) => [...queryKeys.ownerPortal.all, 'booking', id] as const,
    finance: () => [...queryKeys.ownerPortal.all, 'finance'] as const,
    financeSummary: () => [...queryKeys.ownerPortal.all, 'finance', 'summary'] as const,
    financeBooking: (bookingId: string) => [...queryKeys.ownerPortal.all, 'finance', 'booking', bookingId] as const,
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ADMIN USERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  adminUsers: {
    all: ['admin-users'] as const,
    list: () => [...queryKeys.adminUsers.all, 'list'] as const,
  },
} as const

