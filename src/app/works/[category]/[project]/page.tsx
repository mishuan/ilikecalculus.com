import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectSlideshow } from "@/components/project-slideshow";
import {
  categoryOrder,
  projectHref,
  projects,
  type ProjectCategory,
  projectsByCategoryAndSlug,
  projectsBySlug,
} from "@/data/site-content";

type ProjectPageProps = {
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

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
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

const projectOrder = projects;

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
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

  const projectIndex = projectOrder.findIndex((item) => item.slug === currentProject.slug);
  const previousProject = projectIndex > 0 ? projectOrder[projectIndex - 1] : null;
  const nextProject = projectIndex >= 0 && projectIndex < projectOrder.length - 1
    ? projectOrder[projectIndex + 1]
    : null;
  const photoParam = Array.isArray(rawSearchParams?.photo)
    ? rawSearchParams?.photo[0]
    : rawSearchParams?.photo;
  const requestedPhoto = Number.parseInt(photoParam ?? "1", 10);
  const initialIndex = Number.isNaN(requestedPhoto)
    ? 0
    : Math.min(Math.max(requestedPhoto - 1, 0), currentProject.images.length - 1);

  return (
    <ProjectSlideshow
      key={`${currentProject.slug}-${initialIndex}`}
      project={currentProject}
      initialIndex={initialIndex}
      previousProject={
        previousProject
          ? { href: projectHref(previousProject, activeCategory), title: previousProject.title }
          : null
      }
      nextProject={
        nextProject ? { href: projectHref(nextProject, activeCategory), title: nextProject.title } : null
      }
    />
  );
}
