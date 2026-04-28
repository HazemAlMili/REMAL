import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { amenitiesService } from "@/lib/api/services/amenities.service";
import {
  CreateAmenityRequest,
  UpdateAmenityRequest,
  UpdateAmenityStatusRequest,
} from "@/lib/types";

export function useAmenities() {
  const queryClient = useQueryClient();
  const queryKey = ["amenities"];

  const amenitiesQuery = useQuery({
    queryKey,
    queryFn: () => amenitiesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAmenityRequest) => amenitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAmenityRequest }) =>
      amenitiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAmenityStatusRequest;
    }) => amenitiesService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    amenities: amenitiesQuery.data ?? [],
    isLoading: amenitiesQuery.isLoading,
    isError: amenitiesQuery.isError,
    createAmenity: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAmenity: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
