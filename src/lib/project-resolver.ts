import {
  categoryOrder,
  isProjectCategory,
  projectHref,
  projectThumbnailsHref,
  projects,
  projectsByCategoryAndSlug,
  projectsBySlug,
  type Project,
  type ProjectCategory,
} from "@/data/site-content";

type ResolveProjectResult =
  | { kind: "resolved"; project: Project; activeCategory: ProjectCategory }
  | { kind: "redirect"; href: string }
  | { kind: "not-found" };

type ProjectNeighbor = {
  href: string;
  title: string;
} | null;

function resolveActiveCategory(project: Project, requestedCategory: string): ProjectCategory {
  const firstCategory = project.categories[0];
  const fallbackCategory: ProjectCategory = firstCategory && isProjectCategory(firstCategory)
    ? firstCategory
    : categoryOrder[0];

  if (!isProjectCategory(requestedCategory)) {
    return fallbackCategory;
  }

  return project.categories.some((category) => category === requestedCategory)
    ? requestedCategory
    : fallbackCategory;
}

export function resolveProjectRoute(category: string, projectSlug: string): ResolveProjectResult {
  const byCategory = projectsByCategoryAndSlug[`${category}/${projectSlug}`];

  if (byCategory) {
    return {
      kind: "resolved",
      project: byCategory,
      activeCategory: resolveActiveCategory(byCategory, category),
    };
  }

  const bySlug = projectsBySlug[projectSlug];
  if (bySlug) {
    return {
      kind: "redirect",
      href: projectHref(bySlug),
    };
  }

  return { kind: "not-found" };
}

export function projectMetadataDescription(project: Project) {
  return project.description || `Photography project: ${project.title}`;
}

export function projectNeighbors(projectSlug: string, activeCategory: ProjectCategory): {
  previousProject: ProjectNeighbor;
  nextProject: ProjectNeighbor;
  nextProjectThumbnails: ProjectNeighbor;
} {
  const projectIndex = projects.findIndex((item) => item.slug === projectSlug);

  const previousProject =
    projectIndex > 0
      ? {
          href: projectHref(projects[projectIndex - 1], activeCategory),
          title: projects[projectIndex - 1].title,
        }
      : null;

  const nextProject =
    projectIndex >= 0 && projects.length > 1
      ? {
          href: projectHref(projects[(projectIndex + 1) % projects.length], activeCategory),
          title: projects[(projectIndex + 1) % projects.length].title,
        }
      : null;

  const nextProjectThumbnails =
    projectIndex >= 0 && projects.length > 1
      ? {
          href: projectThumbnailsHref(projects[(projectIndex + 1) % projects.length], activeCategory),
          title: projects[(projectIndex + 1) % projects.length].title,
        }
      : null;

  return {
    previousProject,
    nextProject,
    nextProjectThumbnails,
  };
}
