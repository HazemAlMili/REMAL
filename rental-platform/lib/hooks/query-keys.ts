import { ReportFilters } from "../types/report.types";

export const queryKeys = {
  reports: {
    all: ["reports"] as const,
    bookingsSummary: (filters: ReportFilters) =>
      ["reports", "bookings", filters] as const,
    financeSummary: (filters: ReportFilters) =>
      ["reports", "finance", filters] as const,
  },
  units: {
    all: ["units"] as const,
    publicList: (filters?: object) =>
      ["units", "public", "list", filters] as const,
    publicDetail: (id: string) => ["units", "public", "detail", id] as const,
    internalList: (filters?: object) =>
      ["units", "internal", "list", filters] as const,
    internalDetail: (id: string) =>
      ["units", "internal", "detail", id] as const,
    images: (unitId: string) => ["units", unitId, "images"] as const,
    amenities: (unitId: string) => ["units", unitId, "amenities"] as const,
    dateBlocks: (unitId: string) => ["units", unitId, "dateBlocks"] as const,
    seasonalPricing: (unitId: string) =>
      ["units", unitId, "seasonalPricing"] as const,
    availability: (unitId: string, month?: number, year?: number) =>
      ["units", unitId, "availability", month, year] as const,
    pricing: (unitId: string, filters: object) =>
      ["units", unitId, "pricing", filters] as const,
  },
  areas: {
    all: ["areas"] as const,
    list: (includeInactive: boolean) =>
      ["areas", "list", { includeInactive }] as const,
    detail: (id: string) => ["areas", "detail", id] as const,
  },
  owners: {
    all: ["owners"] as const,
    list: (filters?: object) => ["owners", "list", filters] as const,
  },
};
