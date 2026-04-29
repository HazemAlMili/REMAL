import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { ClientDetailsResponse } from "@/lib/types/client.types";

export const clientsService = {
  getById: (id: string): Promise<ClientDetailsResponse> =>
    api.get(endpoints.clients.byId(id)),
};
