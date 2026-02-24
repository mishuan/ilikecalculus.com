import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  readContentBundle,
  rebuildGeneratedSiteData,
  writeWorkspace,
} from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";

function normalizeCategory(rawValue: string) {
  return rawValue.trim().toLowerCase().replace(/\s+/g, "-");
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const body = (await request.json()) as { category?: string };
    const rawCategory = body.category;

    if (!rawCategory || rawCategory.trim().length === 0) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }

    const category = normalizeCategory(rawCategory);
    if (!/^[a-z0-9-]+$/.test(category)) {
      return NextResponse.json(
        { error: "category must contain only lowercase letters, numbers, or hyphens" },
        { status: 400 },
      );
    }

    const { workspace, projects } = await readContentBundle();
    if (workspace.categories.includes(category)) {
      return NextResponse.json(
        {
          workspace,
          projects: orderedProjects(workspace, projects),
        },
        { status: 200 },
      );
    }

    const nextWorkspace = {
      ...workspace,
      categories: [...workspace.categories, category],
    };

    await writeWorkspace(nextWorkspace);
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

export async function PATCH(request: NextRequest) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const body = (await request.json()) as { categories?: string[] };
    const nextCategories = body.categories;

    if (!Array.isArray(nextCategories) || nextCategories.length === 0) {
      return NextResponse.json({ error: "categories must be a non-empty array" }, { status: 400 });
    }

    const { workspace } = await readContentBundle();
    if (nextCategories.length !== workspace.categories.length) {
      return NextResponse.json(
        { error: "categories length must match existing category count" },
        { status: 400 },
      );
    }

    const nextSet = new Set(nextCategories);
    if (nextSet.size !== nextCategories.length) {
      return NextResponse.json({ error: "categories must not contain duplicates" }, { status: 400 });
    }

    for (const category of nextCategories) {
      if (!workspace.categories.includes(category)) {
        return NextResponse.json(
          { error: `Unknown category in categories reorder: ${category}` },
          { status: 400 },
        );
      }
    }

    const nextWorkspace = {
      ...workspace,
      categories: nextCategories,
    };

    await writeWorkspace(nextWorkspace);
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
