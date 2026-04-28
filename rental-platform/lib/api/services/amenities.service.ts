import api from "../axios";
import { endpoints } from "../endpoints";
import {
  AmenityResponse,
  CreateAmenityRequest,
  UpdateAmenityRequest,
  UpdateAmenityStatusRequest,
} from "@/lib/types";

export const amenitiesService = {
  getAll: async (
    includeInactive: boolean = false
  ): Promise<AmenityResponse[]> => {
    return api.get(endpoints.amenities.list, { params: { includeInactive } });
  },

  create: async (data: CreateAmenityRequest): Promise<AmenityResponse> => {
    return api.post(endpoints.amenities.create, data);
  },

  update: async (
    id: string,
    data: UpdateAmenityRequest
  ): Promise<AmenityResponse> => {
    return api.put(endpoints.amenities.update(id), data);
  },

  updateStatus: async (
    id: string,
    data: UpdateAmenityStatusRequest
  ): Promise<AmenityResponse> => {
    return api.patch(endpoints.amenities.status(id), data);
  },
};
