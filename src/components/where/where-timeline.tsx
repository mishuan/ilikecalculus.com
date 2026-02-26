"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WhereEditor, type WhereLocationFormValue } from "@/components/where/where-editor";
import { WhereTimelineSection } from "@/components/where/where-timeline-section";
import type {
  ResolvedWhereLocation,
  WhereLocationMutationInput,
} from "@/components/where/use-where-state";
import { toWhereLocationMutationInput } from "@/lib/where-location-input";

type WhereTimelineProps = {
  currentLocation: ResolvedWhereLocation | null;
  pastLocations: ResolvedWhereLocation[];
  upcomingLocations: ResolvedWhereLocation[];
  selectedLocationId: string | null;
  latestPastLocationId: string | null;
  isEditMode: boolean;
  isLoadingEditorState: boolean;
  isCreatingLocation: boolean;
  updatingLocationId: string | null;
  deletingLocationId: string | null;
  onSelectLocation: (id: string) => void;
  onCreateLocation: (input: WhereLocationMutationInput) => Promise<boolean>;
  onUpdateLocation: (id: string, input: WhereLocationMutationInput) => Promise<boolean>;
  onDeleteLocation: (id: string) => Promise<boolean>;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalDateTimeValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

function createEmptyDraft(): WhereLocationFormValue {
  return {
    label: "",
    coordinates: "",
    atLocal: toLocalDateTimeValue(new Date()),
    note: "",
  };
}

function toDraft(location: ResolvedWhereLocation): WhereLocationFormValue {
  return {
    label: location.label,
    coordinates: `${location.latitude}, ${location.longitude}`,
    atLocal: toLocalDateTimeValue(new Date(location.at)),
    note: location.note,
  };
}

export function WhereTimeline({
  currentLocation,
  pastLocations,
  upcomingLocations,
  selectedLocationId,
  latestPastLocationId,
  isEditMode,
  isLoadingEditorState,
  isCreatingLocation,
  updatingLocationId,
  deletingLocationId,
  onSelectLocation,
  onCreateLocation,
  onUpdateLocation,
  onDeleteLocation,
}: WhereTimelineProps) {
  const [createDraft, setCreateDraft] = useState<WhereLocationFormValue>(() => createEmptyDraft());
  const [createFormError, setCreateFormError] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<WhereLocationFormValue>(() => createEmptyDraft());
  const [editFormError, setEditFormError] = useState("");
  const entryRefMap = useRef<Map<string, HTMLElement>>(new Map());

  const isMutating = isCreatingLocation || updatingLocationId !== null || deletingLocationId !== null;
  const isBusy = isLoadingEditorState || isMutating;
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  useEffect(() => {
    if (!selectedLocationId) {
      return;
    }

    const selectedEntry = entryRefMap.current.get(selectedLocationId);
    if (!selectedEntry) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    selectedEntry.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [selectedLocationId]);

  const registerEntryRef = (id: string, node: HTMLElement | null) => {
    if (!node) {
      entryRefMap.current.delete(id);
      return;
    }

    entryRefMap.current.set(id, node);
  };

  const handleCreate = async () => {
    const parsed = toWhereLocationMutationInput(createDraft);
    if (!parsed.payload) {
      setCreateFormError(parsed.error);
      return;
    }

    setCreateFormError("");
    const created = await onCreateLocation(parsed.payload);
    if (created) {
      setCreateDraft(createEmptyDraft());
    }
  };

  const openEditorForLocation = (location: ResolvedWhereLocation) => {
    setEditingLocationId(location.id);
    setEditFormError("");
    setEditDraft(toDraft(location));
  };

  const handleSaveEdit = async () => {
    if (!editingLocationId) {
      return;
    }

    const parsed = toWhereLocationMutationInput(editDraft);
    if (!parsed.payload) {
      setEditFormError(parsed.error);
      return;
    }

    setEditFormError("");
    const updated = await onUpdateLocation(editingLocationId, parsed.payload);
    if (updated) {
      setEditingLocationId(null);
    }
  };

  const timelineSections = [
    {
      key: "current",
      title: "current",
      emptyText: "No current location yet.",
      locations: currentLocation ? [currentLocation] : [],
      variant: "current",
    },
    {
      key: "upcoming",
      title: "upcoming",
      emptyText: "No upcoming locations yet.",
      locations: upcomingLocations,
      variant: "upcoming",
    },
    {
      key: "past",
      title: "past",
      emptyText: "No past locations yet.",
      locations: pastLocations,
      variant: "past",
    },
  ] as const;

  return (
    <section className="where-timeline">
      {isEditMode ? (
        <div className="where-timeline__editor-block">
          <h2 className="where-timeline__subhead">add location</h2>
          <WhereEditor
            title="Add location"
            value={createDraft}
            submitLabel={isCreatingLocation ? "saving..." : "add location"}
            disabled={isBusy}
            onChange={setCreateDraft}
            onSubmit={() => void handleCreate()}
            testId="where-add-location-editor"
          />
          {createFormError ? <p className="where-editor__error">{createFormError}</p> : null}
        </div>
      ) : null}

      {timelineSections.map((section) => (
        <WhereTimelineSection
          key={section.key}
          title={section.title}
          emptyText={section.emptyText}
          locations={section.locations}
          variant={section.variant}
          selectedLocationId={selectedLocationId}
          latestPastLocationId={latestPastLocationId}
          isEditMode={isEditMode}
          isBusy={isBusy}
          updatingLocationId={updatingLocationId}
          deletingLocationId={deletingLocationId}
          editingLocationId={editingLocationId}
          editDraft={editDraft}
          editFormError={editFormError}
          dateFormatter={dateFormatter}
          registerEntryRef={registerEntryRef}
          onSelectLocation={onSelectLocation}
          onOpenEditor={openEditorForLocation}
          onDeleteLocation={(id) => void onDeleteLocation(id)}
          onEditDraftChange={setEditDraft}
          onSaveEdit={() => void handleSaveEdit()}
          onCancelEdit={() => setEditingLocationId(null)}
        />
      ))}
    </section>
  );
}
