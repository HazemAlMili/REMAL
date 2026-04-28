export const endpoints = {
  // ──────────── AUTH ────────────
  auth: {
    clientRegister: "/api/auth/client/register",
    clientLogin: "/api/auth/client/login",
    adminLogin: "/api/auth/admin/login",
    ownerLogin: "/api/auth/owner/login",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },

  // ──────────── ADMIN USERS ────────────
  adminUsers: {
    list: "/api/admin-users",
    create: "/api/admin-users",
    role: (id: string) => `/api/admin-users/${id}/role`,
    status: (id: string) => `/api/admin-users/${id}/status`,
  },

  // ──────────── AMENITIES ────────────
  amenities: {
    list: "/api/amenities",
    create: "/api/amenities",
    byId: (id: string) => `/api/amenities/${id}`,
    update: (id: string) => `/api/amenities/${id}`,
    status: (id: string) => `/api/amenities/${id}/status`,
  },

  // ──────────── AREAS ────────────
  areas: {
    list: "/api/areas",
    create: "/api/areas",
    byId: (id: string) => `/api/areas/${id}`,
    update: (id: string) => `/api/areas/${id}`,
    status: (id: string) => `/api/areas/${id}/status`,
  },

  // ──────────── UNITS (PUBLIC) ────────────
  units: {
    publicList: "/api/units",
    publicById: (id: string) => `/api/units/${id}`,
    images: (unitId: string) => `/api/units/${unitId}/images`,
    amenities: (unitId: string) => `/api/units/${unitId}/amenities`,
    operationalCheck: (unitId: string) =>
      `/api/units/${unitId}/availability/operational-check`,
    pricingCalculate: (unitId: string) =>
      `/api/units/${unitId}/pricing/calculate`,
  },

  // ──────────── UNITS (INTERNAL) ────────────
  internalUnits: {
    list: "/api/internal/units",
    create: "/api/internal/units",
    byId: (id: string) => `/api/internal/units/${id}`,
    update: (id: string) => `/api/internal/units/${id}`,
    delete: (id: string) => `/api/internal/units/${id}`,
    status: (id: string) => `/api/internal/units/${id}/status`,
  },

  // ──────────── UNIT IMAGES ────────────
  internalUnitImages: {
    create: (unitId: string) => `/api/internal/units/${unitId}/images`,
    reorder: (unitId: string) => `/api/internal/units/${unitId}/images/reorder`,
    cover: (unitId: string, imageId: string) =>
      `/api/internal/units/${unitId}/images/${imageId}/cover`,
    delete: (unitId: string, imageId: string) =>
      `/api/internal/units/${unitId}/images/${imageId}`,
  },

  // ──────────── UNIT AMENITIES ────────────
  internalUnitAmenities: {
    add: (unitId: string) => `/api/internal/units/${unitId}/amenities`,
    replace: (unitId: string) => `/api/internal/units/${unitId}/amenities`,
    remove: (unitId: string, amenityId: string) =>
      `/api/internal/units/${unitId}/amenities/${amenityId}`,
  },

  // ──────────── SEASONAL PRICING ────────────
  seasonalPricing: {
    list: (unitId: string) => `/api/internal/units/${unitId}/seasonal-pricing`,
    create: (unitId: string) =>
      `/api/internal/units/${unitId}/seasonal-pricing`,
    update: (id: string) => `/api/internal/seasonal-pricing/${id}`,
    delete: (id: string) => `/api/internal/seasonal-pricing/${id}`,
  },

  // ──────────── DATE BLOCKS ────────────
  dateBlocks: {
    list: (unitId: string) => `/api/internal/units/${unitId}/date-blocks`,
    create: (unitId: string) => `/api/internal/units/${unitId}/date-blocks`,
    update: (id: string) => `/api/internal/date-blocks/${id}`,
    delete: (id: string) => `/api/internal/date-blocks/${id}`,
  },

  // ──────────── BOOKINGS (INTERNAL) ────────────
  internalBookings: {
    list: "/api/internal/bookings",
    create: "/api/internal/bookings",
    byId: (id: string) => `/api/internal/bookings/${id}`,
    update: (id: string) => `/api/internal/bookings/${id}`,
    statusHistory: (id: string) =>
      `/api/internal/bookings/${id}/status-history`,
  },

  // ──────────── BOOKING LIFECYCLE ────────────
  bookingLifecycle: {
    confirm: (id: string) => `/api/internal/bookings/${id}/confirm`,
    cancel: (id: string) => `/api/internal/bookings/${id}/cancel`,
    complete: (id: string) => `/api/internal/bookings/${id}/complete`,
  },

  // ──────────── CRM LEADS ────────────
  crmLeads: {
    create: "/api/crm/leads",
    list: "/api/internal/crm/leads",
    byId: (id: string) => `/api/internal/crm/leads/${id}`,
    update: (id: string) => `/api/internal/crm/leads/${id}`,
    status: (id: string) => `/api/internal/crm/leads/${id}/status`,
    convertToBooking: (id: string) =>
      `/api/internal/crm/leads/${id}/convert-to-booking`,
  },

  // ──────────── CRM NOTES ────────────
  crmNotes: {
    bookingNotesList: (bookingId: string) =>
      `/api/internal/bookings/${bookingId}/notes`,
    bookingNotesCreate: (bookingId: string) =>
      `/api/internal/bookings/${bookingId}/notes`,
    leadNotesList: (leadId: string) =>
      `/api/internal/crm/leads/${leadId}/notes`,
    leadNotesCreate: (leadId: string) =>
      `/api/internal/crm/leads/${leadId}/notes`,
    update: (id: string) => `/api/internal/crm/notes/${id}`,
    delete: (id: string) => `/api/internal/crm/notes/${id}`,
  },

  // ──────────── CRM ASSIGNMENTS ────────────
  crmAssignments: {
    bookingGet: (bookingId: string) =>
      `/api/internal/bookings/${bookingId}/assignment`,
    bookingSet: (bookingId: string) =>
      `/api/internal/bookings/${bookingId}/assignment`,
    bookingDelete: (bookingId: string) =>
      `/api/internal/bookings/${bookingId}/assignment`,
    leadGet: (leadId: string) => `/api/internal/crm/leads/${leadId}/assignment`,
    leadSet: (leadId: string) => `/api/internal/crm/leads/${leadId}/assignment`,
    leadDelete: (leadId: string) =>
      `/api/internal/crm/leads/${leadId}/assignment`,
  },

  // ──────────── PAYMENTS ────────────
  payments: {
    list: "/api/internal/payments",
    create: "/api/internal/payments",
    byId: (id: string) => `/api/internal/payments/${id}`,
    markPaid: (id: string) => `/api/internal/payments/${id}/mark-paid`,
    markFailed: (id: string) => `/api/internal/payments/${id}/mark-failed`,
    cancel: (id: string) => `/api/internal/payments/${id}/cancel`,
  },

  // ──────────── INVOICES ────────────
  invoices: {
    list: "/api/internal/invoices",
    byId: (id: string) => `/api/internal/invoices/${id}`,
    createDraft: "/api/internal/invoices/drafts",
    addAdjustment: (id: string) =>
      `/api/internal/invoices/${id}/items/manual-adjustment`,
    issue: (id: string) => `/api/internal/invoices/${id}/issue`,
    cancel: (id: string) => `/api/internal/invoices/${id}/cancel`,
    balance: (id: string) => `/api/internal/invoices/${id}/balance`,
  },

  // ──────────── FINANCE SUMMARY ────────────
  financeSummary: {
    bookingFinanceSnapshot: (bookingId: string) =>
      `/api/internal/bookings/${bookingId}/finance-snapshot`,
    ownerPayoutSummary: (ownerId: string) =>
      `/api/internal/owners/${ownerId}/payout-summary`,
  },

  // ──────────── OWNER PAYOUTS ────────────
  ownerPayouts: {
    byBooking: (bookingId: string) =>
      `/api/internal/owner-payouts/by-booking/${bookingId}`,
    byOwner: (ownerId: string) => `/api/internal/owners/${ownerId}/payouts`,
    create: "/api/internal/owner-payouts",
    schedule: (id: string) => `/api/internal/owner-payouts/${id}/schedule`,
    markPaid: (id: string) => `/api/internal/owner-payouts/${id}/mark-paid`,
    cancel: (id: string) => `/api/internal/owner-payouts/${id}/cancel`,
  },

  // ──────────── REPORTS — BOOKINGS ────────────
  reportsBookings: {
    daily: "/api/internal/reports/bookings/daily",
    summary: "/api/internal/reports/bookings/summary",
  },

  // ──────────── REPORTS — FINANCE ────────────
  reportsFinance: {
    daily: "/api/internal/reports/finance/daily",
    summary: "/api/internal/reports/finance/summary",
  },

  // ──────────── OWNERS ────────────
  owners: {
    list: "/api/owners",
    create: "/api/owners",
    byId: (id: string) => `/api/owners/${id}`,
    update: (id: string) => `/api/owners/${id}`,
    status: (id: string) => `/api/owners/${id}/status`,
  },

  // ──────────── CLIENTS ────────────
  clients: {
    list: "/api/clients",
    byId: (id: string) => `/api/clients/${id}`,
  },

  // ──────────── REVIEWS — PUBLIC ────────────
  publicReviews: {
    byUnitSummary: (unitId: string) => `/api/units/${unitId}/reviews/summary`,
    byUnitList: (unitId: string) => `/api/units/${unitId}/reviews`,
    byUnitDetail: (unitId: string, reviewId: string) =>
      `/api/units/${unitId}/reviews/${reviewId}`,
  },

  // ──────────── REVIEWS — CLIENT ────────────
  clientReviews: {
    create: "/api/reviews",
    update: (reviewId: string) => `/api/reviews/${reviewId}`,
    byBooking: (bookingId: string) => `/api/reviews/by-booking/${bookingId}`,
  },

  // ──────────── REVIEW MODERATION ────────────
  reviewModeration: {
    publish: (reviewId: string) => `/api/reviews/${reviewId}/publish`,
    reject: (reviewId: string) => `/api/reviews/${reviewId}/reject`,
    hide: (reviewId: string) => `/api/reviews/${reviewId}/hide`,
    statusHistory: (reviewId: string) =>
      `/api/reviews/${reviewId}/status-history`,
  },

  // ──────────── REVIEW REPLIES (Owner) ────────────
  reviewReplies: {
    get: (reviewId: string) => `/api/owner/reviews/${reviewId}/reply`,
    upsert: (reviewId: string) => `/api/owner/reviews/${reviewId}/reply`,
    delete: (reviewId: string) => `/api/owner/reviews/${reviewId}/reply`,
    visibility: (reviewId: string) =>
      `/api/owner/reviews/${reviewId}/reply/visibility`,
  },

  // ──────────── NOTIFICATION INBOX (3 personas) ────────────
  notifications: {
    admin: {
      inbox: "/api/internal/me/notifications/inbox",
      summary: "/api/internal/me/notifications/inbox/summary",
      read: (id: string) => `/api/internal/me/notifications/inbox/${id}/read`,
    },
    client: {
      inbox: "/api/client/me/notifications/inbox",
      summary: "/api/client/me/notifications/inbox/summary",
      read: (id: string) => `/api/client/me/notifications/inbox/${id}/read`,
    },
    owner: {
      inbox: "/api/owner/me/notifications/inbox",
      summary: "/api/owner/me/notifications/inbox/summary",
      read: (id: string) => `/api/owner/me/notifications/inbox/${id}/read`,
    },
  },

  // ──────────── NOTIFICATION PREFERENCES (3 personas) ────────────
  notificationPreferences: {
    adminGet: "/api/internal/me/notification-preferences",
    adminUpdate: "/api/internal/me/notification-preferences",
    clientGet: "/api/client/me/notification-preferences",
    clientUpdate: "/api/client/me/notification-preferences",
    ownerGet: "/api/owner/me/notification-preferences",
    ownerUpdate: "/api/owner/me/notification-preferences",
  },

  // ──────────── OWNER PORTAL ────────────
  ownerPortal: {
    dashboard: "/api/owner/dashboard",
    bookings: "/api/owner/bookings",
    bookingById: (id: string) => `/api/owner/bookings/${id}`,
    earnings: "/api/owner/earnings",
    payouts: "/api/owner/payouts",
    notifications: "/api/owner/notifications",
    units: "/api/owner/units",
    unitById: (id: string) => `/api/owner/units/${id}`,
    unitAvailability: (id: string) => `/api/owner/units/${id}/availability`,
  },
} as const;
