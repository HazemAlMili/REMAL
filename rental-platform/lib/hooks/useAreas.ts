import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { areasService } from "../api/services/areas.service";
import { queryKeys } from "./query-keys";
import {
  CreateAreaRequest,
  UpdateAreaRequest,
  UpdateAreaStatusRequest,
} from "../types/area.types";

export const useAreasList = (includeInactive: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.areas.list(includeInactive),
    queryFn: () => areasService.getAreas(includeInactive),
  });
};

export const useCreateArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAreaRequest) => areasService.createArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.areas.all });
    },
  });
};

export const useUpdateArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAreaRequest }) =>
      areasService.updateArea(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.areas.list(true) });
      queryClient.invalidateQueries({ queryKey: queryKeys.areas.list(false) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.areas.detail(variables.id),
      });
    },
  });
};

export const useToggleAreaStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAreaStatusRequest }) =>
      areasService.toggleStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.areas.list(true) });
      queryClient.invalidateQueries({ queryKey: queryKeys.areas.list(false) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.areas.detail(variables.id),
      });
    },
  });
};
