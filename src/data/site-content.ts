import {
  generatedCategoryLabels,
  generatedCategoryOrder,
  generatedSiteData,
} from "@/data/generated-site-data";

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

export const categoryOrder = [...generatedCategoryOrder] as ProjectCategory[];

export const categoryLabels: Record<ProjectCategory, string> = Object.fromEntries(
  categoryOrder.map((category) => [category, generatedCategoryLabels[category] ?? category]),
) as Record<ProjectCategory, string>;

export const siteData = generatedSiteData;
export type ProjectSlug = Project["slug"];
export const projects: Project[] = siteData.projects.map((project) => ({
  ...project,
  categories: [...project.categories],
  coverImage: project.coverImage ? { ...project.coverImage } : null,
  images: project.images.map((image) => ({ ...image })),
}));

export const projectsBySlug: Record<string, Project> = Object.fromEntries(
  projects.map((project) => [project.slug, project]),
) as Record<string, Project>;

export const projectsByCategoryAndSlug: Record<string, Project> = Object.fromEntries(
  projects.flatMap((project) =>
    project.categories.map((category) => [`${category}/${project.slug}`, project] as const),
  ),
) as Record<string, Project>;

export const groupedProjects = categoryOrder.map((category) => ({
  category,
  label: categoryLabels[category],
  projects: projects.filter((project) => project.categories.some((item) => item === category)),
}));

export const featuredProjects = siteData.featuredProjectSlugs
  .map((slug) => projectsBySlug[slug])
  .filter(Boolean);

export function projectHref(project: Project, preferredCategory?: ProjectCategory) {
  const category =
    preferredCategory && project.categories.some((item) => item === preferredCategory)
      ? preferredCategory
      : project.categories[0];

  return `/works/${category}/${project.slug}`;
}

export function projectThumbnailsHref(project: Project, preferredCategory?: ProjectCategory) {
  return `${projectHref(project, preferredCategory)}/thumbnails`;
}

export const navItems = [
  { label: "home", href: "/" },
  { label: "projects", href: "/works" },
  { label: "about", href: "/about" },
  { label: "contact", href: "/contact" },
  { label: "press", href: "/press" },
  { label: "blog", href: siteData.site.blogUrl, external: true },
] as const;
