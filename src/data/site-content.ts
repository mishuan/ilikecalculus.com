import {
  generatedCategoryLabels,
  generatedCategoryOrder,
  generatedSiteData,
} from "@/data/generated-site-data";
import type { LocationEntry } from "@/data/content-types";

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type PressItem = {
  outlet: string;
  title: string;
  url: string;
};

export type ProjectCategory = (typeof generatedCategoryOrder)[number];

export type Project = {
  slug: string;
  categories: string[];
  title: string;
  description: string;
  coverImage: ProjectImage | null;
  images: ProjectImage[];
};

export type WhereLocation = LocationEntry;

export const categoryOrder = [...generatedCategoryOrder] as ProjectCategory[];

export const categoryLabels: Record<ProjectCategory, string> = Object.fromEntries(
  categoryOrder.map((category) => [category, generatedCategoryLabels[category] ?? category]),
) as Record<ProjectCategory, string>;

const categorySet = new Set<ProjectCategory>(categoryOrder);

export function isProjectCategory(value: string): value is ProjectCategory {
  return categorySet.has(value as ProjectCategory);
}

function toProjectCategoryList(values: readonly string[], label: string): string[] {
  if (values.length === 0) {
    throw new Error(`${label} must include at least one category`);
  }

  return [...values];
}

export const siteData = generatedSiteData;
export type ProjectSlug = Project["slug"];
export const whereLocations: WhereLocation[] = (siteData.where.locations as readonly WhereLocation[]).map((location) => ({
  ...location,
}));

export const projects: Project[] = siteData.projects.map((project) => ({
  ...project,
  categories: toProjectCategoryList(project.categories, `projects.${project.slug}.categories`),
  coverImage: project.coverImage ? { ...project.coverImage } : null,
  images: project.images.map((image) => ({ ...image })),
}));

export const projectsBySlug: Record<ProjectSlug, Project> = Object.fromEntries(
  projects.map((project) => [project.slug, project]),
) as Record<ProjectSlug, Project>;

export const projectsByCategoryAndSlug: Record<string, Project> = Object.fromEntries(
  projects.flatMap((project) =>
    project.categories.map((category) => [`${category}/${project.slug}`, project] as const),
  ),
);

export function projectHref(project: Project, preferredCategory?: ProjectCategory) {
  const fallbackCategory = isProjectCategory(project.categories[0] ?? "")
    ? project.categories[0]
    : categoryOrder[0];
  const category =
    preferredCategory && project.categories.some((item) => item === preferredCategory)
      ? preferredCategory
      : fallbackCategory;

  return `/works/${category}/${project.slug}`;
}

export function projectThumbnailsHref(project: Project, preferredCategory?: ProjectCategory) {
  return `${projectHref(project, preferredCategory)}/thumbnails`;
}

export const navItems = [
  { label: "home", href: "/" },
  { label: "projects", href: "/works" },
  { label: "where is", href: "/where" },
  { label: "contact", href: "/contact" },
  { label: "press", href: "/press" },
  { label: "blog", href: siteData.site.blogUrl, external: true },
] as const;
