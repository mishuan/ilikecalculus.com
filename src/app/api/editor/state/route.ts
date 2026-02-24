import { NextResponse } from "next/server";
import { orderedProjects } from "@/app/api/editor/_helpers";
import { readContentBundle } from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";

export const runtime = "nodejs";

export async function GET() {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  const { workspace, projects } = await readContentBundle();
  return NextResponse.json({
    workspace,
    projects: orderedProjects(workspace, projects),
  });
}
