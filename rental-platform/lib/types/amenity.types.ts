export interface AmenityResponse {
  id: string;
  name: string;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAmenityRequest {
  name: string;
  icon?: string;
}

export interface UpdateAmenityRequest {
  name: string;
  icon?: string;
}

export interface UpdateAmenityStatusRequest {
  isActive: boolean;
}
