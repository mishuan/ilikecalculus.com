"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { WhereLocation } from "@/data/site-content";
import { useEditMode } from "@/hooks/use-edit-mode";
import {
  createLocation as createEditorLocation,
  deleteLocation as deleteEditorLocation,
  fetchEditorState,
  updateLocation as updateEditorLocation,
  type EditorStatePayload,
} from "@/lib/editor-api-client";

export type ResolvedWhereLocation = WhereLocation & {
  atMs: number;
  isFuture: boolean;
};

export type WhereLocationMutationInput = {
  label: string;
  latitude: number;
  longitude: number;
  at: string;
  note: string;
};

type UseWhereStateInput = {
  initialLocations: WhereLocation[];
};

function byTimeAsc(a: ResolvedWhereLocation, b: ResolvedWhereLocation) {
  if (a.atMs === b.atMs) {
    return a.id.localeCompare(b.id);
  }

  return a.atMs - b.atMs;
}

function byTimeDesc(a: ResolvedWhereLocation, b: ResolvedWhereLocation) {
  if (a.atMs === b.atMs) {
    return a.id.localeCompare(b.id);
  }

  return b.atMs - a.atMs;
}

export function useWhereState({ initialLocations }: UseWhereStateInput) {
  const router = useRouter();
  const isEditMode = useEditMode();

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [editorState, setEditorState] = useState<EditorStatePayload | null>(null);
  const [isLoadingEditorState, setIsLoadingEditorState] = useState(false);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [updatingLocationId, setUpdatingLocationId] = useState<string | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setEditorState(null);
      setStatus("");
      setError("");
      return;
    }

    let isCanceled = false;

    const loadEditorState = async () => {
      setIsLoadingEditorState(true);
      setError("");

      try {
        const payload = await fetchEditorState();
        if (!isCanceled) {
          setEditorState(payload);
        }
      } catch (loadError) {
        if (!isCanceled) {
          const message = loadError instanceof Error ? loadError.message : "Unable to load edit state.";
          setError(message);
        }
      } finally {
        if (!isCanceled) {
          setIsLoadingEditorState(false);
        }
      }
    };

    void loadEditorState();

    return () => {
      isCanceled = true;
    };
  }, [isEditMode]);

  const sourceLocations = isEditMode && editorState
    ? editorState.workspace.where.locations
    : initialLocations;

  const resolvedLocations = useMemo(
    () =>
      sourceLocations.map((location) => {
        const atMs = new Date(location.at).getTime();
        return {
          ...location,
          atMs,
          isFuture: atMs > nowMs,
        };
      }),
    [nowMs, sourceLocations],
  );

  const mapLocations = useMemo(() => [...resolvedLocations].sort(byTimeAsc), [resolvedLocations]);
  const pastCurrentLocations = useMemo(
    () => resolvedLocations.filter((location) => !location.isFuture).sort(byTimeDesc),
    [resolvedLocations],
  );
  const upcomingLocations = useMemo(
    () => resolvedLocations.filter((location) => location.isFuture).sort(byTimeAsc),
    [resolvedLocations],
  );
  const currentLocation = pastCurrentLocations[0] ?? null;
  const pastLocations = pastCurrentLocations.slice(1);

  const latestPastLocationId = currentLocation?.id ?? null;
  const defaultSelectedId = latestPastLocationId ?? upcomingLocations[0]?.id ?? null;

  useEffect(() => {
    if (!selectedLocationId) {
      setSelectedLocationId(defaultSelectedId);
      return;
    }

    const stillExists = resolvedLocations.some((location) => location.id === selectedLocationId);
    if (!stillExists) {
      setSelectedLocationId(defaultSelectedId);
    }
  }, [defaultSelectedId, resolvedLocations, selectedLocationId]);

  const createLocation = async (input: WhereLocationMutationInput) => {
    if (!isEditMode || !editorState) {
      return false;
    }

    setIsCreatingLocation(true);
    setStatus("");
    setError("");

    try {
      const payload = await createEditorLocation(input);
      setEditorState(payload);
      setStatus("Location added.");
      if (payload.createdLocation) {
        setSelectedLocationId(payload.createdLocation.id);
      }
      router.refresh();
      return true;
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Unable to add location.";
      setError(message);
      return false;
    } finally {
      setIsCreatingLocation(false);
    }
  };

  const updateLocation = async (id: string, input: WhereLocationMutationInput) => {
    if (!isEditMode || !editorState) {
      return false;
    }

    setUpdatingLocationId(id);
    setStatus("");
    setError("");

    try {
      const payload = await updateEditorLocation(id, input);
      setEditorState(payload);
      setStatus("Location updated.");
      if (payload.updatedLocation) {
        setSelectedLocationId(payload.updatedLocation.id);
      }
      router.refresh();
      return true;
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Unable to update location.";
      setError(message);
      return false;
    } finally {
      setUpdatingLocationId(null);
    }
  };

  const deleteLocation = async (id: string) => {
    if (!isEditMode || !editorState) {
      return false;
    }

    setDeletingLocationId(id);
    setStatus("");
    setError("");

    try {
      const payload = await deleteEditorLocation(id);
      setEditorState(payload);
      setStatus("Location deleted.");
      router.refresh();
      return true;
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete location.";
      setError(message);
      return false;
    } finally {
      setDeletingLocationId(null);
    }
  };

  return {
    isEditMode,
    isLoadingEditorState,
    isCreatingLocation,
    updatingLocationId,
    deletingLocationId,
    status,
    error,
    selectedLocationId,
    setSelectedLocationId,
    currentLocation,
    pastLocations,
    upcomingLocations,
    mapLocations,
    latestPastLocationId,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}
