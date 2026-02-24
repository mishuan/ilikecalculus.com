import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  readContentBundle,
  readProject,
  rebuildGeneratedSiteData,
  validateProjectManifest,
  writeProject,
} from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";

export const runtime = "nodejs";

type ProjectRouteParams = {
  params: Promise<{ slug: string }>;
};

export async function PATCH(request: NextRequest, { params }: ProjectRouteParams) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const { slug } = await params;
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      categories?: string[];
    };

    const { workspace } = await readContentBundle();
    const project = await readProject(slug);

    const nextTitle = body.title !== undefined ? body.title.trim() : project.title;
    const nextDescription =
      body.description !== undefined ? body.description.trim() : project.description;
    const nextCategories = body.categories !== undefined ? body.categories : project.categories;

    if (!nextTitle) {
      return NextResponse.json({ error: "title must be a non-empty string" }, { status: 400 });
    }

    if (!Array.isArray(nextCategories) || nextCategories.length === 0) {
      return NextResponse.json({ error: "categories must be a non-empty array" }, { status: 400 });
    }

    const categorySet = new Set(workspace.categories);
    for (const category of nextCategories) {
      if (!categorySet.has(category)) {
        return NextResponse.json(
          { error: `Unknown category on project update: ${category}` },
          { status: 400 },
        );
      }
    }

    const nextProject = {
      ...project,
      title: nextTitle,
      description: nextDescription,
      categories: nextCategories,
    };

    validateProjectManifest(nextProject, categorySet);
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
