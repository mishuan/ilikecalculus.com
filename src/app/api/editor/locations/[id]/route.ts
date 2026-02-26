import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  readContentBundle,
  rebuildGeneratedSiteData,
  writeWorkspace,
} from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";
import { applyWhereLocationPatch } from "@/lib/where-location-input";

export const runtime = "nodejs";

type LocationRouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: LocationRouteParams) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      label?: unknown;
      latitude?: unknown;
      longitude?: unknown;
      at?: unknown;
      note?: unknown;
    };

    const { workspace } = await readContentBundle();
    const index = workspace.where.locations.findIndex((location) => location.id === id);
    if (index < 0) {
      return NextResponse.json({ error: `Unknown location id: ${id}` }, { status: 404 });
    }

    const existing = workspace.where.locations[index];
    const nextLocation = applyWhereLocationPatch(existing, body);
    const nextLocations = workspace.where.locations.map((location, locationIndex) =>
      locationIndex === index ? nextLocation : location,
    );

    const nextWorkspace = {
      ...workspace,
      where: {
        ...workspace.where,
        locations: nextLocations,
      },
    };

    await writeWorkspace(nextWorkspace);
    await rebuildGeneratedSiteData();

    const updated = await readContentBundle();
    return NextResponse.json({
      workspace: updated.workspace,
      projects: orderedProjects(updated.workspace, updated.projects),
      updatedLocation: nextLocation,
    });
  } catch (error) {
    return toJsonError(error);
  }
}

export async function DELETE(_: Request, { params }: LocationRouteParams) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const { id } = await params;
    const { workspace } = await readContentBundle();
    const index = workspace.where.locations.findIndex((location) => location.id === id);
    if (index < 0) {
      return NextResponse.json({ error: `Unknown location id: ${id}` }, { status: 404 });
    }

    const nextWorkspace = {
      ...workspace,
      where: {
        ...workspace.where,
        locations: workspace.where.locations.filter((location) => location.id !== id),
      },
    };

    await writeWorkspace(nextWorkspace);
    await rebuildGeneratedSiteData();

    const updated = await readContentBundle();
    return NextResponse.json({
      workspace: updated.workspace,
      projects: orderedProjects(updated.workspace, updated.projects),
      deletedLocationId: id,
    });
  } catch (error) {
    return toJsonError(error);
  }
}
