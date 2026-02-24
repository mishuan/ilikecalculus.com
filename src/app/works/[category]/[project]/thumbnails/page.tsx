import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ProjectThumbnailsView } from "@/components/project-thumbnails-view";
import {
  projects,
} from "@/data/site-content";
import {
  projectMetadataDescription,
  projectNeighbors,
  resolveProjectRoute,
} from "@/lib/project-resolver";

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

export default async function ProjectThumbnailsPage({
  params,
  searchParams,
}: ProjectThumbnailsPageProps) {
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
  const photoParam = Array.isArray(rawSearchParams?.photo)
    ? rawSearchParams?.photo[0]
    : rawSearchParams?.photo;
  const requestedPhoto = Number.parseInt(photoParam ?? "", 10);
  const activePhoto = Number.isNaN(requestedPhoto) || currentProject.images.length === 0
    ? undefined
    : Math.min(Math.max(requestedPhoto, 1), currentProject.images.length);
  const { nextProjectThumbnails } = projectNeighbors(currentProject.slug, activeCategory);

  return (
    <Suspense fallback={null}>
      <ProjectThumbnailsView
        project={currentProject}
        activeCategory={activeCategory}
        activePhoto={activePhoto}
        nextProject={nextProjectThumbnails}
      />
    </Suspense>
  );
}
