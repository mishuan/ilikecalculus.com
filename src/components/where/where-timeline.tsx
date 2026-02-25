"use client";

import { useMemo, useState } from "react";
import { EditorButton } from "@/components/ui/editor-controls";
import { WhereEditor, type WhereLocationFormValue } from "@/components/where/where-editor";
import type {
  ResolvedWhereLocation,
  WhereLocationMutationInput,
} from "@/components/where/use-where-state";
import { classNames } from "@/components/ui/class-names";

type WhereTimelineProps = {
  pastCurrentLocations: ResolvedWhereLocation[];
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

function parseCoordinatePair(rawValue: string): { latitude: number; longitude: number } | null {
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

function toMutationInput(value: WhereLocationFormValue): {
  payload: WhereLocationMutationInput | null;
  error: string;
} {
  const label = value.label.trim();
  if (!label) {
    return { payload: null, error: "Location name is required." };
  }

  const parsedCoordinates = parseCoordinatePair(value.coordinates);
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

export function WhereTimeline({
  pastCurrentLocations,
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

  const handleCreate = async () => {
    const parsed = toMutationInput(createDraft);
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

    const parsed = toMutationInput(editDraft);
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

      <div className="where-timeline__group">
        <h2 className="where-timeline__subhead">past &amp; current</h2>
        {pastCurrentLocations.length === 0 ? (
          <p className="where-timeline__empty">No past locations yet.</p>
        ) : (
          <div className="where-entry-list">
            {pastCurrentLocations.map((location) => {
              const isSelected = selectedLocationId === location.id;
              const isLatest = latestPastLocationId === location.id;
              const isUpdating = updatingLocationId === location.id;
              const isDeleting = deletingLocationId === location.id;
              const isEditing = editingLocationId === location.id;

              return (
                <article
                  key={location.id}
                  className={classNames(
                    "where-entry",
                    isSelected && "where-entry--selected",
                    isLatest && "where-entry--latest",
                  )}
                >
                  <button
                    type="button"
                    className="where-entry__main"
                    onClick={() => onSelectLocation(location.id)}
                  >
                    <p className="where-entry__label">{location.label}</p>
                    <p className="where-entry__time">{dateFormatter.format(new Date(location.at))}</p>
                    {location.note ? <p className="where-entry__note">{location.note}</p> : null}
                  </button>

                  {isEditMode ? (
                    <div className="where-entry__actions">
                      <EditorButton
                        onClick={() => openEditorForLocation(location)}
                        disabled={isBusy}
                      >
                        edit
                      </EditorButton>
                      <EditorButton
                        variant="danger"
                        onClick={() => void onDeleteLocation(location.id)}
                        disabled={isBusy}
                      >
                        {isDeleting ? "deleting..." : "delete"}
                      </EditorButton>
                    </div>
                  ) : null}

                  {isEditMode && isEditing ? (
                    <div className="where-entry__editor">
                      <WhereEditor
                        title={`Edit ${location.label}`}
                        value={editDraft}
                        submitLabel={isUpdating ? "saving..." : "save"}
                        disabled={isBusy}
                        onChange={setEditDraft}
                        onSubmit={() => void handleSaveEdit()}
                        onCancel={() => setEditingLocationId(null)}
                      />
                      {editFormError ? <p className="where-editor__error">{editFormError}</p> : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="where-timeline__group">
        <h2 className="where-timeline__subhead">upcoming</h2>
        {upcomingLocations.length === 0 ? (
          <p className="where-timeline__empty">No upcoming locations yet.</p>
        ) : (
          <div className="where-entry-list">
            {upcomingLocations.map((location) => {
              const isSelected = selectedLocationId === location.id;
              const isUpdating = updatingLocationId === location.id;
              const isDeleting = deletingLocationId === location.id;
              const isEditing = editingLocationId === location.id;

              return (
                <article
                  key={location.id}
                  className={classNames(
                    "where-entry",
                    "where-entry--future",
                    isSelected && "where-entry--selected",
                  )}
                >
                  <button
                    type="button"
                    className="where-entry__main"
                    onClick={() => onSelectLocation(location.id)}
                  >
                    <p className="where-entry__label">{location.label}</p>
                    <p className="where-entry__time">{dateFormatter.format(new Date(location.at))}</p>
                    {location.note ? <p className="where-entry__note">{location.note}</p> : null}
                  </button>

                  {isEditMode ? (
                    <div className="where-entry__actions">
                      <EditorButton
                        onClick={() => openEditorForLocation(location)}
                        disabled={isBusy}
                      >
                        edit
                      </EditorButton>
                      <EditorButton
                        variant="danger"
                        onClick={() => void onDeleteLocation(location.id)}
                        disabled={isBusy}
                      >
                        {isDeleting ? "deleting..." : "delete"}
                      </EditorButton>
                    </div>
                  ) : null}

                  {isEditMode && isEditing ? (
                    <div className="where-entry__editor">
                      <WhereEditor
                        title={`Edit ${location.label}`}
                        value={editDraft}
                        submitLabel={isUpdating ? "saving..." : "save"}
                        disabled={isBusy}
                        onChange={setEditDraft}
                        onSubmit={() => void handleSaveEdit()}
                        onCancel={() => setEditingLocationId(null)}
                      />
                      {editFormError ? <p className="where-editor__error">{editFormError}</p> : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
