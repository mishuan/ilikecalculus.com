import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  readContentBundle,
  rebuildGeneratedSiteData,
  writeWorkspace,
} from "@/lib/content-store";
import type { LocationEntry } from "@/data/content-types";
import { editorGuardResponse } from "@/lib/editor-guard";
import { parseWhereLocationCreateBody } from "@/lib/where-location-input";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const body = (await request.json()) as {
      label?: unknown;
      latitude?: unknown;
      longitude?: unknown;
      at?: unknown;
      note?: unknown;
    };

    const nextLocation: LocationEntry = {
      id: randomUUID(),
      ...parseWhereLocationCreateBody(body),
    };

    const { workspace } = await readContentBundle();
    const nextWorkspace = {
      ...workspace,
      where: {
        ...workspace.where,
        locations: [...workspace.where.locations, nextLocation],
      },
    };

    await writeWorkspace(nextWorkspace);
    await rebuildGeneratedSiteData();

    const updated = await readContentBundle();
    return NextResponse.json({
      workspace: updated.workspace,
      projects: orderedProjects(updated.workspace, updated.projects),
      createdLocation: nextLocation,
    });
  } catch (error) {
    return toJsonError(error);
  }
}
