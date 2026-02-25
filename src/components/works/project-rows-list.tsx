"use client";

import { ProjectCollageRow } from "@/components/project-collage-row";
import { Reveal } from "@/components/reveal";
import type { Project, ProjectCategory } from "@/data/site-content";

type ProjectRowsListProps = {
  projects: Project[];
  rowKeyPrefix: string;
  editMode: boolean;
  reorderEnabled: boolean;
  preferredCategory?: ProjectCategory;
  onProjectDragStart: (slug: string) => void;
  onProjectDrop: (targetSlug: string) => void;
  onProjectDragEnd: () => void;
};

export function ProjectRowsList({
  projects,
  rowKeyPrefix,
  editMode,
  reorderEnabled,
  preferredCategory,
  onProjectDragStart,
  onProjectDrop,
  onProjectDragEnd,
}: ProjectRowsListProps) {
  return (
    <div className="category-section__rows">
      {projects.map((project) => (
        <Reveal key={`${rowKeyPrefix}-${project.slug}`} rootMargin="0px 0px 220px">
          <ProjectCollageRow
            project={project}
            preferredCategory={preferredCategory}
            editMode={editMode}
            reorderEnabled={reorderEnabled}
            onProjectDragStart={onProjectDragStart}
            onProjectDrop={onProjectDrop}
            onProjectDragEnd={onProjectDragEnd}
          />
        </Reveal>
      ))}
    </div>
  );
}
