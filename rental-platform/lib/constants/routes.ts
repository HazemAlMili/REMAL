export const ROUTES = {
  // Public
  home: '/',
  unitsList: '/units',
  unitDetail: (id: string) => `/units/${id}`,
  bookingConfirmation: (id: string) => `/bookings/${id}`,

  // Auth
  auth: {
    adminLogin: '/auth/admin/login',
    ownerLogin: '/auth/owner/login',
    clientLogin: '/auth/client/login',
    register: '/auth/client/register',
  },

  // Admin
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    areas: '/admin/areas',
    units: {
      list: '/admin/units',
      detail: (id: string) => `/admin/units/${id}`,
      create: '/admin/units/new',
      edit: (id: string) => `/admin/units/${id}/edit`,
    },
    crm: {
      index: '/admin/crm',
      leadDetail: (id: string) => `/admin/crm/leads/${id}`,
    },
    bookings: {
      list: '/admin/bookings',
      detail: (id: string) => `/admin/bookings/${id}`,
    },
    finance: '/admin/finance',
    owners: {
      list: '/admin/owners',
      detail: (id: string) => `/admin/owners/${id}`,
      create: '/admin/owners/new',
    },
    clients: {
      list: '/admin/clients',
      detail: (id: string) => `/admin/clients/${id}`,
    },
    reviews: '/admin/reviews',
    settings: '/admin/settings',
  },

  // Owner Portal
  owner: {
    root: '/owner',
    dashboard: '/owner/dashboard',
    units: '/owner/units',
    unitDetail: (id: string) => `/owner/units/${id}`,
    bookings: '/owner/bookings',
    bookingDetail: (id: string) => `/owner/bookings/${id}`,
    finance: '/owner/finance',
    notifications: '/owner/notifications',
  },

  // Client / Account
  client: {
    account: '/account',
    bookings: '/account/bookings',
    bookingReview: (id: string) => `/account/bookings/${id}/review`,
    notifications: '/account/notifications',
  },
} as const
