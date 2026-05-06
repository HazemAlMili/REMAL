import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ClientDetailsResponse,
  ClientListFilters,
  PaginatedClients,
  PaginatedBookings,
  UpdateClientStatusRequest,
} from "@/lib/types";

export const clientsService = {
  getAll: (filters?: ClientListFilters): Promise<PaginatedClients> =>
    api.get(endpoints.clients.list, { params: filters }),

  getById: (id: string): Promise<ClientDetailsResponse> =>
    api.get(endpoints.clients.byId(id)),

  updateStatus: (
    id: string,
    data: UpdateClientStatusRequest
  ): Promise<ClientDetailsResponse> => api.patch(endpoints.clients.status(id), data),

  // Backend gap: client booking-history endpoint is not documented.
  // Keep this method blocked behind backend confirmation.
  getBookings: async (): Promise<PaginatedBookings> =>
    Promise.reject(
      new Error("Backend gap: no documented client booking-history endpoint")
    ),
};
