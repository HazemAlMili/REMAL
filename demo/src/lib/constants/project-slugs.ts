import type { Project } from "@/lib/api/types";

/**
 * The storefront links projects by a human slug (e.g. `?project=abraj`), but
 * the backend has no slug column. Map known slugs to seeded project names and
 * resolve them against the live `/api/projects` list at runtime.
 */
export const PROJECT_SLUG_ALIASES: Record<string, string> = {
  abraj: "Abraj Al Alamein",
  palm: "Palm Hills",
  mazarine: "Mazarine",
  gate: "The Gate",
};

export function resolveProjectId(
  slug: string | null | undefined,
  projects: Project[]
): string | null {
  if (!slug) return null;
  const target = (PROJECT_SLUG_ALIASES[slug] ?? slug).toLowerCase();
  const match = projects.find((p) => p.name.toLowerCase().includes(target));
  return match?.id ?? null;
}
