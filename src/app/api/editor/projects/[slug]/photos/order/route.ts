import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  readContentBundle,
  readProject,
  rebuildGeneratedSiteData,
  writeProject,
} from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";

export const runtime = "nodejs";

type ProjectPhotoOrderRouteParams = {
  params: Promise<{ slug: string }>;
};

export async function PATCH(request: NextRequest, { params }: ProjectPhotoOrderRouteParams) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const { slug } = await params;
    const body = (await request.json()) as { orderedSrcs?: string[] };
    const orderedSrcs = body.orderedSrcs;

    if (!Array.isArray(orderedSrcs)) {
      return NextResponse.json({ error: "orderedSrcs must be an array" }, { status: 400 });
    }

    const project = await readProject(slug);
    const currentSrcs = project.images.map((image) => image.src);

    if (orderedSrcs.length !== currentSrcs.length) {
      return NextResponse.json(
        { error: "orderedSrcs must contain exactly the same number of photos as project.images" },
        { status: 400 },
      );
    }

    const orderedSet = new Set(orderedSrcs);
    if (orderedSet.size !== orderedSrcs.length) {
      return NextResponse.json({ error: "orderedSrcs must not contain duplicates" }, { status: 400 });
    }

    for (const src of orderedSrcs) {
      if (!currentSrcs.includes(src)) {
        return NextResponse.json({ error: `Unknown image src in orderedSrcs: ${src}` }, { status: 400 });
      }
    }

    const imageBySrc = new Map(project.images.map((image) => [image.src, image]));
    const nextImages = orderedSrcs
      .map((src) => imageBySrc.get(src))
      .filter((image): image is NonNullable<typeof image> => Boolean(image));

    const nextProject = {
      ...project,
      images: nextImages,
    };

    const { workspace } = await readContentBundle();
    await writeProject(nextProject, workspace.categories);
    await rebuildGeneratedSiteData();

    const updated = await readContentBundle();
    return NextResponse.json({
      workspace: updated.workspace,
      projects: orderedProjects(updated.workspace, updated.projects),
    });
  } catch (error) {
    return toJsonError(error);
  }
}
