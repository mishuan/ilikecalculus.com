"use client";

import { EditorButton } from "@/components/ui/editor-controls";
import { classNames } from "@/components/ui/class-names";
import { WhereEditor, type WhereLocationFormValue } from "@/components/where/where-editor";
import { createHoverIntent } from "@/components/where/where-hover-intent";
import type { ResolvedWhereLocation } from "@/components/where/use-where-state";

type WhereTimelineSectionVariant = "current" | "upcoming" | "past";

type WhereTimelineSectionProps = {
  title: string;
  emptyText: string;
  locations: ResolvedWhereLocation[];
  variant: WhereTimelineSectionVariant;
  selectedLocationId: string | null;
  hoveredLocationId: string | null;
  focusedLocationId: string | null;
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
  onHoverLocation: (id: string | null) => void;
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
  hoveredLocationId,
  focusedLocationId,
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
  onHoverLocation,
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
          {locations.map((location, index) => {
            const isSelected = selectedLocationId === location.id;
            const isHovered = hoveredLocationId === location.id;
            const isFocused = focusedLocationId === location.id;
            const isLatest = variant === "current" && latestPastLocationId === location.id;
            const isUpdating = updatingLocationId === location.id;
            const isDeleting = deletingLocationId === location.id;
            const isEditing = editingLocationId === location.id;
            const shouldShowSelectedPreview = Boolean(location.note) && isSelected;
            const shouldShowHoverPreview = Boolean(location.note) && isHovered && !isSelected;
            const hoverIntent = createHoverIntent({
              locationId: location.id,
              hoveredLocationId,
              onHoverLocation,
            });

            return (
              <article
                key={location.id}
                ref={(node) => registerEntryRef(location.id, node)}
                className={classNames(
                  "where-entry",
                  variant === "upcoming" && "where-entry--future",
                  isSelected && "where-entry--selected",
                  isHovered && "where-entry--hovered",
                  isFocused && "where-entry--focused",
                  isLatest && "where-entry--latest",
                  index === 0 && "where-entry--hover-note-below",
                )}
                data-testid={`where-entry-${location.id}`}
              >
                <button
                  type="button"
                  className="where-entry__main"
                  onPointerEnter={hoverIntent.activate}
                  onPointerLeave={hoverIntent.clear}
                  onFocus={hoverIntent.activate}
                  onBlur={hoverIntent.clear}
                  onClick={() => onSelectLocation(location.id)}
                >
                  <p className="where-entry__label">{location.label}</p>
                  <p className="where-entry__time">{dateFormatter.format(new Date(location.at))}</p>
                  {shouldShowSelectedPreview ? <p className="where-entry__note">{location.note}</p> : null}
                </button>

                {shouldShowHoverPreview ? <p className="where-entry__hover-note">{location.note}</p> : null}

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
