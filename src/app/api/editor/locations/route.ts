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

export const runtime = "nodejs";

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
  if (value === undefined) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error("note must be a string");
  }

  return value;
}

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
      label: parseLabel(body.label),
      latitude: parseCoordinate(body.latitude, "latitude", -90, 90),
      longitude: parseCoordinate(body.longitude, "longitude", -180, 180),
      at: parseAt(body.at),
      note: parseNote(body.note),
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
