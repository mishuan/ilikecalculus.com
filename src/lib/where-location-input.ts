import type { LocationEntry } from "@/data/content-types";

type WhereLocationBody = {
  label?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  at?: unknown;
  note?: unknown;
};

export type WhereLocationMutationInput = Pick<
  LocationEntry,
  "label" | "latitude" | "longitude" | "at" | "note"
>;

export type WhereLocationFormInput = {
  label: string;
  coordinates: string;
  atLocal: string;
  note: string;
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

function parseOptionalNote(value: unknown) {
  if (value === undefined) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error("note must be a string");
  }

  return value;
}

function parseRequiredNote(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("note must be a string");
  }

  return value;
}

export function parseCoordinatesText(rawValue: string): { latitude: number; longitude: number } | null {
  const matches = rawValue.match(/[-+]?\d*\.?\d+/g);
  if (!matches || matches.length < 2) {
    return null;
  }

  const latitude = Number.parseFloat(matches[0]);
  const longitude = Number.parseFloat(matches[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export function toWhereLocationMutationInput(value: WhereLocationFormInput): {
  payload: WhereLocationMutationInput | null;
  error: string;
} {
  const label = value.label.trim();
  if (!label) {
    return { payload: null, error: "Location name is required." };
  }

  const parsedCoordinates = parseCoordinatesText(value.coordinates);
  if (!parsedCoordinates) {
    return { payload: null, error: "Coordinates must include latitude and longitude." };
  }

  const { latitude, longitude } = parsedCoordinates;
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { payload: null, error: "Latitude must be between -90 and 90." };
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { payload: null, error: "Longitude must be between -180 and 180." };
  }

  if (!value.atLocal) {
    return { payload: null, error: "Time is required." };
  }

  const date = new Date(value.atLocal);
  if (Number.isNaN(date.getTime())) {
    return { payload: null, error: "Time must be a valid datetime." };
  }

  return {
    payload: {
      label,
      latitude,
      longitude,
      at: date.toISOString(),
      note: value.note,
    },
    error: "",
  };
}

export function parseWhereLocationCreateBody(body: WhereLocationBody): WhereLocationMutationInput {
  return {
    label: parseLabel(body.label),
    latitude: parseCoordinate(body.latitude, "latitude", -90, 90),
    longitude: parseCoordinate(body.longitude, "longitude", -180, 180),
    at: parseAt(body.at),
    note: parseOptionalNote(body.note),
  };
}

export function applyWhereLocationPatch(current: LocationEntry, body: WhereLocationBody): LocationEntry {
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
    note: body.note !== undefined ? parseRequiredNote(body.note) : current.note,
  };
}
