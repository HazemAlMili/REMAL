"use client";

import { Modal } from "@/components/ui/Modal";
import { ProjectForm, ProjectFormValues } from "./ProjectForm";
import { ProjectResponse } from "@/lib/types/project.types";
import { useCreateProject, useUpdateProject } from "@/lib/hooks/useProjects";
import { toastSuccess, toastError } from "@/lib/utils/toast";

export interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectResponse;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  project,
}: ProjectFormModalProps) {
  const isEditing = !!project;

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const isLoading = createProject.isPending || updateProject.isPending;

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      if (isEditing && project) {
        await updateProject.mutateAsync({ id: project.id, data });
        toastSuccess("Project updated successfully");
      } else {
        await createProject.mutateAsync(data);
        toastSuccess("Project created successfully");
      }
      onClose();
    } catch (e: unknown) {
      const msg = (e as Error)?.message || "Could not save project";
      toastError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit project" : "New project"}
    >
      <div className="mb-4">
        <p className="text-sm text-neutral-500">
          {isEditing
            ? "Update the details for this project."
            : "Create a resort project for unit assignment and client search."}
        </p>
      </div>
      <ProjectForm
        defaultValues={
          project
            ? { name: project.name, description: project.description }
            : {}
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
