import { NextRequest, NextResponse } from "next/server";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  readContentBundle,
  rebuildGeneratedSiteData,
  writeWorkspace,
} from "@/lib/content-store";
import type { LocationEntry } from "@/data/content-types";
import { editorGuardResponse } from "@/lib/editor-guard";

export const runtime = "nodejs";

type LocationRouteParams = {
  params: Promise<{ id: string }>;
};

function parseCoordinate(
  value: unknown,
  fieldPath: "latitude" | "longitude",
  min: number,
  max: number,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${fieldPath} must be a finite number`);
  }

  if (value < min || value > max) {
    throw new Error(`${fieldPath} must be between ${min} and ${max}`);
  }

  return value;
}

function parseAt(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("at is required");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("at must be a valid datetime");
  }

  return date.toISOString();
}

function parseLabel(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("label is required");
  }

  return value.trim();
}

function parseNote(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("note must be a string");
  }

  return value;
}

function resolveNextLocation(
  current: LocationEntry,
  body: {
    label?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    at?: unknown;
    note?: unknown;
  },
) {
  return {
    ...current,
    label: body.label !== undefined ? parseLabel(body.label) : current.label,
    latitude:
      body.latitude !== undefined
        ? parseCoordinate(body.latitude, "latitude", -90, 90)
        : current.latitude,
    longitude:
      body.longitude !== undefined
        ? parseCoordinate(body.longitude, "longitude", -180, 180)
        : current.longitude,
    at: body.at !== undefined ? parseAt(body.at) : current.at,
    note: body.note !== undefined ? parseNote(body.note) : current.note,
  };
}

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
    const nextLocation = resolveNextLocation(existing, body);
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
