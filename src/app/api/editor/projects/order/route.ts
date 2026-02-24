import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  readContentBundle,
  rebuildGeneratedSiteData,
  writeWorkspace,
} from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const body = (await request.json()) as { projectOrder?: string[] };
    const nextOrder = body.projectOrder;

    if (!Array.isArray(nextOrder) || nextOrder.length === 0) {
      return NextResponse.json({ error: "projectOrder must be a non-empty array" }, { status: 400 });
    }

    const { workspace, projects } = await readContentBundle();
    const knownSlugs = new Set(projects.map((project) => project.slug));

    if (nextOrder.length !== knownSlugs.size) {
      return NextResponse.json(
        { error: "projectOrder length must match the number of projects" },
        { status: 400 },
      );
    }

    const nextSet = new Set(nextOrder);
    if (nextSet.size !== nextOrder.length) {
      return NextResponse.json({ error: "projectOrder must not contain duplicates" }, { status: 400 });
    }

    for (const slug of nextOrder) {
      if (!knownSlugs.has(slug)) {
        return NextResponse.json({ error: `Unknown project slug in projectOrder: ${slug}` }, { status: 400 });
      }
    }

    const nextWorkspace = {
      ...workspace,
      projectOrder: nextOrder,
    };
    await writeWorkspace(nextWorkspace);
    await rebuildGeneratedSiteData();

    const updatedBundle = await readContentBundle();
    return NextResponse.json({
      workspace: updatedBundle.workspace,
      projects: orderedProjects(updatedBundle.workspace, updatedBundle.projects),
    });
  } catch (error) {
    return toJsonError(error);
  }
}
