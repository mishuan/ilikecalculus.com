import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectThumbnailsView } from "@/components/project-thumbnails-view";
import {
  categoryOrder,
  projectHref,
  projectThumbnailsHref,
  projects,
  type ProjectCategory,
  projectsByCategoryAndSlug,
  projectsBySlug,
} from "@/data/site-content";

type ProjectThumbnailsPageProps = {
  params: Promise<{
    category: string;
    project: string;
  }>;
  searchParams?: Promise<{
    photo?: string | string[];
  }>;
};

export async function generateStaticParams() {
  return projects.flatMap((project) =>
    project.categories.map((category) => ({
      category,
      project: project.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: ProjectThumbnailsPageProps): Promise<Metadata> {
  const { category, project } = await params;
  const currentProject = projectsByCategoryAndSlug[`${category}/${project}`];

  if (!currentProject) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${currentProject.title} | Michael Yuan`,
    description: currentProject.description || `Photography project: ${currentProject.title}`,
  };
}

export default async function ProjectThumbnailsPage({
  params,
  searchParams,
}: ProjectThumbnailsPageProps) {
  const { category, project } = await params;
  const rawSearchParams = searchParams ? await searchParams : undefined;
  const currentProject = projectsByCategoryAndSlug[`${category}/${project}`];

  if (!currentProject) {
    const bySlug = projectsBySlug[project];
    if (bySlug) {
      redirect(projectHref(bySlug));
    }
    notFound();
  }

  const requestedCategory = categoryOrder.includes(category as ProjectCategory)
    ? (category as ProjectCategory)
    : currentProject.categories[0];
  const activeCategory = currentProject.categories.some((item) => item === requestedCategory)
    ? requestedCategory
    : currentProject.categories[0];
  const photoParam = Array.isArray(rawSearchParams?.photo)
    ? rawSearchParams?.photo[0]
    : rawSearchParams?.photo;
  const requestedPhoto = Number.parseInt(photoParam ?? "", 10);
  const activePhoto = Number.isNaN(requestedPhoto)
    ? undefined
    : Math.min(Math.max(requestedPhoto, 1), currentProject.images.length);
  const projectIndex = projects.findIndex((item) => item.slug === currentProject.slug);
  const nextProject = projectIndex >= 0 && projects.length > 1
    ? projects[(projectIndex + 1) % projects.length]
    : null;

  return (
    <ProjectThumbnailsView
      project={currentProject}
      activeCategory={activeCategory}
      activePhoto={activePhoto}
      nextProject={
        nextProject
          ? { href: projectThumbnailsHref(nextProject, activeCategory), title: nextProject.title }
          : null
      }
    />
  );
}
