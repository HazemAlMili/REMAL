"use client";

import { useState } from "react";
import { Plus, Building2, AlertCircle } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import {
  useProjectsList,
  useToggleProjectStatus,
} from "@/lib/hooks/useProjects";
import { ProjectResponse } from "@/lib/types/project.types";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastError } from "@/lib/utils/toast";

import { ProjectTable } from "@/components/admin/projects/ProjectTable";
import { ProjectFormModal } from "@/components/admin/projects/ProjectFormModal";

export default function ProjectsPage() {
  const { canManageProjects } = usePermissions();
  const { data: projects, isLoading, isError } = useProjectsList(true);
  const toggleProjectStatus = useToggleProjectStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<
    ProjectResponse | undefined
  >();
  const [statusConfirmProject, setStatusConfirmProject] = useState<
    ProjectResponse | undefined
  >();

  const handleCreate = () => {
    setEditingProject(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (project: ProjectResponse) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleToggleStatusClick = (project: ProjectResponse) => {
    setStatusConfirmProject(project);
  };

  const handleConfirmToggle = async () => {
    if (!statusConfirmProject) return;

    const newStatus = !statusConfirmProject.isActive;
    try {
      await toggleProjectStatus.mutateAsync({
        id: statusConfirmProject.id,
        data: { isActive: newStatus },
      });
      toastSuccess(newStatus ? "Project activated" : "Project deactivated");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Could not update project status");
    } finally {
      setStatusConfirmProject(undefined);
    }
  };

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10" />}
          title="Could not load resort projects"
          description="We could not load resort projects. Retry the page before editing project setup."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Resort projects
          </h1>
          <p className="text-sm text-neutral-500">
            Manage the North Coast projects used for unit setup and client
            search.
          </p>
        </div>

        {canManageProjects && (
          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create project
          </Button>
        )}
      </div>

      <div>
        {isLoading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : projects && projects.length > 0 ? (
          <ProjectTable
            projects={projects}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatusClick}
          />
        ) : (
          <EmptyState
            icon={<Building2 className="h-10 w-10" />}
            title="Resort project catalog is empty"
            description="Create a project before assigning units to a resort development."
            action={
              canManageProjects ? (
                <Button
                  onClick={handleCreate}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create project
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      {isModalOpen && canManageProjects && (
        <ProjectFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          project={editingProject}
        />
      )}

      {statusConfirmProject && canManageProjects && (
        <ConfirmDialog
          isOpen={!!statusConfirmProject}
          onCancel={() => setStatusConfirmProject(undefined)}
          title={
            statusConfirmProject.isActive
              ? "Deactivate project"
              : "Activate project"
          }
          description={
            statusConfirmProject.isActive
              ? `Deactivate "${statusConfirmProject.name}"? Operators will not be able to assign new units to this project.`
              : `Activate "${statusConfirmProject.name}"? Operators can assign new units to this project again.`
          }
          confirmLabel={
            statusConfirmProject.isActive
              ? "Deactivate project"
              : "Activate project"
          }
          variant={statusConfirmProject.isActive ? "danger" : "primary"}
          onConfirm={handleConfirmToggle}
        />
      )}
    </div>
  );
}
