import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectSlideshow } from "@/components/project-slideshow";
import {
  projectThumbnailsHref,
  projects,
} from "@/data/site-content";
import {
  projectMetadataDescription,
  projectNeighbors,
  resolveProjectRoute,
} from "@/lib/project-resolver";

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
  const resolved = resolveProjectRoute(category, project);

  if (resolved.kind !== "resolved") {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${resolved.project.title} | Michael Yuan`,
    description: projectMetadataDescription(resolved.project),
  };
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { category, project } = await params;
  const rawSearchParams = searchParams ? await searchParams : undefined;
  const resolved = resolveProjectRoute(category, project);

  if (resolved.kind === "redirect") {
    redirect(resolved.href);
  }

  if (resolved.kind === "not-found") {
    notFound();
  }

  const { project: currentProject, activeCategory } = resolved;
  if (currentProject.images.length === 0) {
    redirect(projectThumbnailsHref(currentProject, activeCategory));
  }

  const { previousProject, nextProject } = projectNeighbors(currentProject.slug, activeCategory);
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
      activeCategory={activeCategory}
      initialIndex={initialIndex}
      previousProject={previousProject}
      nextProject={nextProject}
    />
  );
}
