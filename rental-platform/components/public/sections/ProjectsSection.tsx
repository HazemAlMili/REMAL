// ═══════════════════════════════════════════════════════════
// components/public/sections/ProjectsSection.tsx
// Projects grid with staggered entrance animation
// ═══════════════════════════════════════════════════════════

"use client";
import { usePublicProjects } from "@/lib/hooks/usePublic";
import { useStaggerCards, useFadeUp } from "@/lib/hooks/animations";
import { ProjectCard } from "@/components/public/cards/ProjectCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function ProjectsSection() {
  const { data: projects, isLoading } = usePublicProjects();
  const headingRef = useFadeUp<HTMLDivElement>();
  const gridRef = useStaggerCards<HTMLDivElement>({ stagger: 0.15 });

  // Filter to active projects only
  const activeProjects = (projects ?? []).filter((project) => project.isActive);

  // Hide section entirely if no active projects (after loading completes)
  if (!isLoading && activeProjects.length === 0) return null;

  return (
    <section className="bg-neutral-50 py-20 lg:py-32">
      <div className="mx-auto max-w-container px-6">
        {/* Section Header */}
        <div
          ref={headingRef}
          className="mb-12 text-center motion-safe:opacity-0 lg:mb-16"
        >
          <span className="font-body text-sm font-medium uppercase tracking-wider text-primary-500">
            Resort projects
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">
            Explore our projects
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 lg:text-lg">
            Compare available homes across our North Coast projects and choose
            the right setting for your next stay.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        )}

        {/* Project Cards Grid */}
        {!isLoading && activeProjects.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
