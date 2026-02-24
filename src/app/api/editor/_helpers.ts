import { NextResponse } from "next/server";
import type { ProjectManifest } from "@/data/content-types";
import type { WorkspaceContent } from "@/data/content-types";

export function toJsonError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Unknown editor error";
  return NextResponse.json({ error: message }, { status });
}

export function orderedProjects(workspace: WorkspaceContent, projects: ProjectManifest[]) {
  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
  return workspace.projectOrder
    .map((slug) => projectBySlug.get(slug))
    .filter((project): project is ProjectManifest => Boolean(project));
}
