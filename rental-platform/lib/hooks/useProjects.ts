import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "../api/services/projects.service";
import { queryKeys } from "./query-keys";
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
} from "../types/project.types";

export const useProjectsList = (includeInactive: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.projects.list(includeInactive),
    queryFn: () => projectsService.getProjects(includeInactive),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      projectsService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectsService.updateProject(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(true),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(false),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      });
    },
  });
};

export const useToggleProjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProjectStatusRequest;
    }) => projectsService.toggleStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(true),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(false),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      });
    },
  });
};
