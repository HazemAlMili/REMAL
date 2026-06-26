import { APIRequestContext } from "@playwright/test";
import fs from "fs";
import path from "path";
import {
  deactivateTestProject,
  deleteTestUnit,
  getInternalUnits,
  getProjects,
} from "./api.helpers";

const OWNER_SMOKE_PREFIXES = [
  "OWN_SMOKE_",
  "owner-smoke-",
  "test-owner-smoke-",
];
const UPLOAD_PREFIXES = ["OWN_SMOKE_", "owner-smoke-", "test-owner-smoke-"];

type UnitListItem = {
  id: string;
  name?: string;
  unitName?: string;
  images?: Array<{ fileKey?: string | null }>;
};

type ProjectListItem = {
  id: string;
  name: string;
  isActive?: boolean;
};

export interface CleanupSummary {
  softDeletedUnits: string[];
  deactivatedProjects: string[];
  deletedUploads: string[];
  failures: string[];
}

export function isOwnerSmokeName(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return OWNER_SMOKE_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function isOwnerSmokeUpload(value: string): boolean {
  return UPLOAD_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function createEmptySummary(): CleanupSummary {
  return {
    softDeletedUnits: [],
    deactivatedProjects: [],
    deletedUploads: [],
    failures: [],
  };
}

export async function cleanupOwnerSmokeData(
  request: APIRequestContext,
  adminToken: string
): Promise<CleanupSummary> {
  const summary = createEmptySummary();
  const activeFileKeys = new Set<string>();

  try {
    const units = await getInternalUnits<UnitListItem>(request, adminToken, {
      page: 1,
      pageSize: 500,
      includeInactive: true,
    });

    for (const unit of units) {
      for (const image of unit.images ?? []) {
        if (image.fileKey) activeFileKeys.add(image.fileKey);
      }

      const unitName = unit.name ?? unit.unitName ?? "";
      if (isOwnerSmokeName(unitName)) {
        const deleted = await deleteTestUnit(request, adminToken, unit.id);
        if (deleted) {
          summary.softDeletedUnits.push(unit.id);
        } else {
          summary.failures.push(`Failed to soft-delete smoke unit ${unit.id}`);
        }
      }
    }
  } catch (error) {
    summary.failures.push(`Unit cleanup failed: ${(error as Error).message}`);
  }

  try {
    const projects = await getProjects<ProjectListItem>(
      request,
      adminToken,
      true
    );
    for (const project of projects) {
      if (isOwnerSmokeName(project.name) && project.isActive !== false) {
        const deactivated = await deactivateTestProject(
          request,
          adminToken,
          project.id
        );
        if (deactivated) {
          summary.deactivatedProjects.push(project.id);
        } else {
          summary.failures.push(
            `Failed to deactivate smoke project ${project.id}`
          );
        }
      }
    }
  } catch (error) {
    summary.failures.push(
      `Project cleanup failed: ${(error as Error).message}`
    );
  }

  cleanupOwnerSmokeUploads(activeFileKeys, summary);

  return summary;
}

function cleanupOwnerSmokeUploads(
  activeFileKeys: Set<string>,
  summary: CleanupSummary
): void {
  const uploadsDir = path.resolve(process.cwd(), "../uploads");
  const workspaceRoot = path.resolve(process.cwd(), "..");

  if (!uploadsDir.startsWith(workspaceRoot)) {
    summary.failures.push(
      `Refused to scan uploads outside workspace: ${uploadsDir}`
    );
    return;
  }

  if (!fs.existsSync(uploadsDir)) return;

  const entries = fs.readdirSync(uploadsDir);
  for (const entry of entries) {
    const entryPath = path.join(uploadsDir, entry);
    const stat = fs.statSync(entryPath);
    if (!stat.isFile()) continue;

    const relativeKey = `uploads/${entry}`;
    const isReferenced =
      activeFileKeys.has(entry) || activeFileKeys.has(relativeKey);

    if (!isReferenced && isOwnerSmokeUpload(entry)) {
      try {
        fs.unlinkSync(entryPath);
        summary.deletedUploads.push(entryPath);
      } catch (error) {
        summary.failures.push(
          `Failed to delete smoke upload ${entryPath}: ${(error as Error).message}`
        );
      }
    }
  }
}
