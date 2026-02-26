"use client";

import { EditorButton } from "@/components/ui/editor-controls";
import { classNames } from "@/components/ui/class-names";
import { WhereEditor, type WhereLocationFormValue } from "@/components/where/where-editor";
import type { ResolvedWhereLocation } from "@/components/where/use-where-state";

type WhereTimelineSectionVariant = "current" | "upcoming" | "past";

type WhereTimelineSectionProps = {
  title: string;
  emptyText: string;
  locations: ResolvedWhereLocation[];
  variant: WhereTimelineSectionVariant;
  selectedLocationId: string | null;
  latestPastLocationId: string | null;
  isEditMode: boolean;
  isBusy: boolean;
  updatingLocationId: string | null;
  deletingLocationId: string | null;
  editingLocationId: string | null;
  editDraft: WhereLocationFormValue;
  editFormError: string;
  dateFormatter: Intl.DateTimeFormat;
  registerEntryRef: (id: string, node: HTMLElement | null) => void;
  onSelectLocation: (id: string) => void;
  onOpenEditor: (location: ResolvedWhereLocation) => void;
  onDeleteLocation: (id: string) => void;
  onEditDraftChange: (nextValue: WhereLocationFormValue) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
};

export function WhereTimelineSection({
  title,
  emptyText,
  locations,
  variant,
  selectedLocationId,
  latestPastLocationId,
  isEditMode,
  isBusy,
  updatingLocationId,
  deletingLocationId,
  editingLocationId,
  editDraft,
  editFormError,
  dateFormatter,
  registerEntryRef,
  onSelectLocation,
  onOpenEditor,
  onDeleteLocation,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
}: WhereTimelineSectionProps) {
  return (
    <div className="where-timeline__group">
      <h2 className="where-timeline__subhead">{title}</h2>
      {locations.length === 0 ? (
        <p className="where-timeline__empty">{emptyText}</p>
      ) : (
        <div className="where-entry-list">
          {locations.map((location) => {
            const isSelected = selectedLocationId === location.id;
            const isLatest = variant === "current" && latestPastLocationId === location.id;
            const isUpdating = updatingLocationId === location.id;
            const isDeleting = deletingLocationId === location.id;
            const isEditing = editingLocationId === location.id;

            return (
              <article
                key={location.id}
                ref={(node) => registerEntryRef(location.id, node)}
                className={classNames(
                  "where-entry",
                  variant === "upcoming" && "where-entry--future",
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
                    <EditorButton onClick={() => onOpenEditor(location)} disabled={isBusy}>
                      edit
                    </EditorButton>
                    <EditorButton
                      variant="danger"
                      onClick={() => onDeleteLocation(location.id)}
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
                      onChange={onEditDraftChange}
                      onSubmit={onSaveEdit}
                      onCancel={onCancelEdit}
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
  );
}
