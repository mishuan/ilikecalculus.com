import fs from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  projectMediaDirectory,
  readContentBundle,
  rebuildGeneratedSiteData,
  writeProject,
  writeWorkspace,
} from "@/lib/content-store";
import { normalizeSlug } from "@/lib/content-schema";
import type { ProjectManifest } from "@/data/content-types";
import { editorGuardResponse } from "@/lib/editor-guard";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      slug?: string;
      description?: string;
      categories?: string[];
    };

    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const normalizedSlug = normalizeSlug(body.slug?.trim() || title);
    if (!normalizedSlug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return NextResponse.json(
        { error: "slug must contain only lowercase letters, numbers, or hyphens" },
        { status: 400 },
      );
    }

    const { workspace, projects } = await readContentBundle();
    const existing = new Set(projects.map((project) => project.slug));
    if (existing.has(normalizedSlug)) {
      return NextResponse.json({ error: `Project slug already exists: ${normalizedSlug}` }, { status: 400 });
    }

    const requestedCategories = Array.isArray(body.categories) ? body.categories : [];
    const nextCategories =
      requestedCategories.length > 0 ? requestedCategories : [workspace.categories[0]];
    const uniqueCategories = [...new Set(nextCategories)];
    if (uniqueCategories.length === 0) {
      return NextResponse.json({ error: "categories must include at least one value" }, { status: 400 });
    }

    const validCategories = new Set(workspace.categories);
    for (const category of uniqueCategories) {
      if (!validCategories.has(category)) {
        return NextResponse.json({ error: `Unknown category on project create: ${category}` }, { status: 400 });
      }
    }

    const nextProject: ProjectManifest = {
      slug: normalizedSlug,
      title,
      description,
      categories: uniqueCategories,
      coverImage: null,
      images: [],
    };

    const nextWorkspace = {
      ...workspace,
      projectOrder: [...workspace.projectOrder, normalizedSlug],
    };

    await writeProject(nextProject, workspace.categories);
    await fs.mkdir(projectMediaDirectory(normalizedSlug), { recursive: true });
    await writeWorkspace(nextWorkspace);
    await rebuildGeneratedSiteData();

    const updated = await readContentBundle();
    return NextResponse.json({
      workspace: updated.workspace,
      projects: orderedProjects(updated.workspace, updated.projects),
      createdProject: nextProject,
    });
  } catch (error) {
    return toJsonError(error);
  }
}
