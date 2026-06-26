"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProjectResponse } from "@/lib/types/project.types";
import { Pencil, Power, PowerOff } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";

interface ProjectTableProps {
  projects: ProjectResponse[];
  onEdit: (project: ProjectResponse) => void;
  onToggleStatus: (project: ProjectResponse) => void;
}

export function ProjectTable({
  projects,
  onEdit,
  onToggleStatus,
}: ProjectTableProps) {
  const { canManageProjects } = usePermissions();

  return (
    <div className="overflow-hidden rounded-[var(--portal-radius-card)] border border-neutral-200">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50">
          <tr>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Name
            </th>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Description
            </th>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Status
            </th>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Created
            </th>
            {canManageProjects && (
              <th className="h-9 w-[100px] px-4 text-end text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {projects.map((project) => (
            <tr
              key={project.id}
              className={`hover:bg-neutral-50/50 ${!project.isActive ? "bg-neutral-50 opacity-60" : ""}`}
            >
              <td className="px-4 py-2.5 align-middle font-medium">
                {project.name}
              </td>
              <td
                className="max-w-[200px] truncate px-4 py-2.5 align-middle text-neutral-500"
                title={project.description}
              >
                {project.description || "-"}
              </td>
              <td className="px-4 py-2.5 align-middle">
                {project.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="neutral">Inactive</Badge>
                )}
              </td>
              <td className="px-4 py-2.5 align-middle tabular-nums text-neutral-500">
                {format(new Date(project.createdAt), "MMM d, yyyy")}
              </td>
              {canManageProjects && (
                <td className="flex items-center justify-end gap-2 px-4 py-2.5 text-end align-middle">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(project)}
                    aria-label={`Edit ${project.name}`}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(project)}
                    aria-label={
                      project.isActive
                        ? `Deactivate ${project.name}`
                        : `Activate ${project.name}`
                    }
                    className="h-8 w-8 p-0"
                  >
                    {project.isActive ? (
                      <PowerOff className="h-4 w-4 text-error" />
                    ) : (
                      <Power className="h-4 w-4 text-success" />
                    )}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
