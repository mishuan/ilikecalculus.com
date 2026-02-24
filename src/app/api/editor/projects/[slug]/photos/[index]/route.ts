import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  mediaAbsolutePathFromSrc,
  readContentBundle,
  readProject,
  rebuildGeneratedSiteData,
  writeProject,
} from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";

export const runtime = "nodejs";

type ProjectPhotoDeleteRouteParams = {
  params: Promise<{ slug: string; index: string }>;
};

export async function DELETE(_: Request, { params }: ProjectPhotoDeleteRouteParams) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const { slug, index } = await params;
    const photoIndex = Number.parseInt(index, 10);
    const project = await readProject(slug);

    if (Number.isNaN(photoIndex) || photoIndex < 0 || photoIndex >= project.images.length) {
      return NextResponse.json({ error: "Photo index is out of bounds" }, { status: 400 });
    }

    const removed = project.images[photoIndex];
    const nextImages = project.images.filter((_, currentIndex) => currentIndex !== photoIndex);
    const nextCoverImage =
      project.coverImage && nextImages.some((image) => image.src === project.coverImage?.src)
        ? project.coverImage
        : nextImages[0] ?? null;

    await fs.unlink(mediaAbsolutePathFromSrc(removed.src)).catch(() => {});

    const nextProject = {
      ...project,
      images: nextImages,
      coverImage: nextCoverImage,
    };

    const { workspace } = await readContentBundle();
    await writeProject(nextProject, workspace.categories);
    await rebuildGeneratedSiteData();

    const updated = await readContentBundle();
    return NextResponse.json({
      workspace: updated.workspace,
      projects: orderedProjects(updated.workspace, updated.projects),
      removedImage: removed,
    });
  } catch (error) {
    return toJsonError(error);
  }
}
