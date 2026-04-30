import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ClientDetailsResponse,
  ClientListFilters,
  PaginatedClients,
  PaginatedBookings,
} from "@/lib/types";

export const clientsService = {
  getAll: (filters?: ClientListFilters): Promise<PaginatedClients> =>
    api.get(endpoints.clients.list, { params: filters }),

  getById: (id: string): Promise<ClientDetailsResponse> =>
    api.get(endpoints.clients.byId(id)),

  // Backend gap: client booking-history endpoint is not documented.
  // Keep this method blocked behind backend confirmation.
  getBookings: async (): Promise<PaginatedBookings> =>
    Promise.reject(
      new Error("Backend gap: no documented client booking-history endpoint")
    ),
};
