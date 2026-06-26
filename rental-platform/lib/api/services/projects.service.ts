import api from "../axios";
import { endpoints } from "../endpoints";
import {
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
} from "@/lib/types/project.types";

export const projectsService = {
  getProjects: async (
    includeInactive: boolean = false
  ): Promise<ProjectResponse[]> => {
    return api.get(endpoints.projects.list, { params: { includeInactive } });
  },

  createProject: async (
    data: CreateProjectRequest
  ): Promise<ProjectResponse> => {
    return api.post(endpoints.projects.create, data);
  },

  updateProject: async (
    id: string,
    data: UpdateProjectRequest
  ): Promise<ProjectResponse> => {
    return api.put(endpoints.projects.update(id), data);
  },

  toggleStatus: async (
    id: string,
    data: UpdateProjectStatusRequest
  ): Promise<ProjectResponse> => {
    return api.patch(endpoints.projects.status(id), data);
  },
};
