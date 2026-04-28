import api from "../axios";
import { endpoints } from "../endpoints";
import {
  PaginatedUnits,
  UnitDetailsResponse,
  UnitImageResponse,
  UnitPricingResponse,
  UnitListFilters,
  CreateUnitRequest,
  UpdateUnitRequest,
  AddUnitImageRequest,
  ReorderUnitImagesRequest,
  UnitAmenityResponse,
  DateBlockResponse,
  CreateDateBlockRequest,
  UpdateDateBlockRequest,
  SeasonalPricingResponse,
  CreateSeasonalPricingRequest,
  UpdateSeasonalPricingRequest,
  CheckOperationalAvailabilityRequest,
  OperationalAvailabilityResponse,
} from "@/lib/types";

export const unitsService = {
  // Public
  getPublicList: async (filters?: object): Promise<PaginatedUnits> => {
    const { data } = await api.get(endpoints.units.publicList, {
      params: filters,
    });
    return data;
  },

  getPublicById: async (id: string): Promise<UnitDetailsResponse> => {
    const { data } = await api.get(endpoints.units.publicById(id));
    return data;
  },

  getPublicImages: async (unitId: string): Promise<UnitImageResponse[]> => {
    const { data } = await api.get(endpoints.units.images(unitId));
    return data;
  },

  getUnitPricing: async (
    unitId: string,
    dataPayload: CheckOperationalAvailabilityRequest
  ): Promise<UnitPricingResponse> => {
    const { data } = await api.post(
      endpoints.units.pricingCalculate(unitId),
      dataPayload
    );
    return data;
  },

  // Internal
  getInternalList: async (
    filters?: UnitListFilters
  ): Promise<PaginatedUnits> => {
    const { data } = await api.get(endpoints.internalUnits.list, {
      params: filters,
    });
    return data;
  },

  getInternalById: async (id: string): Promise<UnitDetailsResponse> => {
    const { data } = await api.get(endpoints.internalUnits.byId(id));
    return data;
  },

  create: async (
    dataPayload: CreateUnitRequest
  ): Promise<UnitDetailsResponse> => {
    const { data } = await api.post(
      endpoints.internalUnits.create,
      dataPayload
    );
    return data;
  },

  update: async (
    id: string,
    dataPayload: UpdateUnitRequest
  ): Promise<UnitDetailsResponse> => {
    const { data } = await api.put(
      endpoints.internalUnits.update(id),
      dataPayload
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { data } = await api.delete(endpoints.internalUnits.delete(id));
    return data;
  },

  updateStatus: async (
    id: string,
    isActive: boolean
  ): Promise<UnitDetailsResponse> => {
    const { data } = await api.patch(endpoints.internalUnits.status(id), {
      isActive,
    });
    return data;
  },

  // Images
  addImage: async (
    unitId: string,
    dataPayload: AddUnitImageRequest
  ): Promise<UnitImageResponse> => {
    const { data } = await api.post(
      endpoints.internalUnitImages.create(unitId),
      dataPayload
    );
    return data;
  },

  reorderImages: async (
    unitId: string,
    dataPayload: ReorderUnitImagesRequest
  ): Promise<void> => {
    const { data } = await api.put(
      endpoints.internalUnitImages.reorder(unitId),
      dataPayload
    );
    return data;
  },

  setCoverImage: async (unitId: string, imageId: string): Promise<void> => {
    const { data } = await api.patch(
      endpoints.internalUnitImages.cover(unitId, imageId)
    );
    return data;
  },

  deleteImage: async (unitId: string, imageId: string): Promise<void> => {
    const { data } = await api.delete(
      endpoints.internalUnitImages.delete(unitId, imageId)
    );
    return data;
  },

  // Amenities
  getAmenities: async (unitId: string): Promise<UnitAmenityResponse[]> => {
    const { data } = await api.get(endpoints.units.amenities(unitId));
    return data;
  },

  replaceAmenities: async (
    unitId: string,
    amenityIds: string[]
  ): Promise<UnitAmenityResponse[]> => {
    const { data } = await api.put(
      endpoints.internalUnitAmenities.replace(unitId),
      { amenityIds }
    );
    return data;
  },

  // Date blocks
  getDateBlocks: async (unitId: string): Promise<DateBlockResponse[]> => {
    const { data } = await api.get(endpoints.dateBlocks.list(unitId));
    return data;
  },

  createDateBlock: async (
    unitId: string,
    dataPayload: CreateDateBlockRequest
  ): Promise<DateBlockResponse> => {
    const { data } = await api.post(
      endpoints.dateBlocks.create(unitId),
      dataPayload
    );
    return data;
  },

  updateDateBlock: async (
    id: string,
    dataPayload: UpdateDateBlockRequest
  ): Promise<DateBlockResponse> => {
    const { data } = await api.put(
      endpoints.dateBlocks.update(id),
      dataPayload
    );
    return data;
  },

  deleteDateBlock: async (id: string): Promise<void> => {
    const { data } = await api.delete(endpoints.dateBlocks.delete(id));
    return data;
  },

  // Seasonal pricing
  getSeasonalPricing: async (
    unitId: string
  ): Promise<SeasonalPricingResponse[]> => {
    const { data } = await api.get(endpoints.seasonalPricing.list(unitId));
    return data;
  },

  createSeasonalPricing: async (
    unitId: string,
    dataPayload: CreateSeasonalPricingRequest
  ): Promise<SeasonalPricingResponse> => {
    const { data } = await api.post(
      endpoints.seasonalPricing.create(unitId),
      dataPayload
    );
    return data;
  },

  updateSeasonalPricing: async (
    id: string,
    dataPayload: UpdateSeasonalPricingRequest
  ): Promise<SeasonalPricingResponse> => {
    const { data } = await api.put(
      endpoints.seasonalPricing.update(id),
      dataPayload
    );
    return data;
  },

  deleteSeasonalPricing: async (id: string): Promise<void> => {
    const { data } = await api.delete(endpoints.seasonalPricing.delete(id));
    return data;
  },

  // Availability
  checkOperationalAvailability: async (
    unitId: string,
    dataPayload: CheckOperationalAvailabilityRequest
  ): Promise<OperationalAvailabilityResponse> => {
    const { data } = await api.post(
      endpoints.units.operationalCheck(unitId),
      dataPayload
    );
    return data;
  },
};
