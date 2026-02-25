"use client";

import {
  EditorButton,
  EditorInput,
  EditorStatus,
} from "@/components/ui/editor-controls";

type WorksInlineEditorProps = {
  isEditMode: boolean;
  isEditorLoading: boolean;
  activeFilter: string | "all";
  editorStatus: string;
  editorError: string;
  showCategoryCreator: boolean;
  newCategory: string;
  isAddingCategory: boolean;
  onNewCategoryChange: (value: string) => void;
  onAddCategory: () => void;
};

export function WorksInlineEditor({
  isEditMode,
  isEditorLoading,
  activeFilter,
  editorStatus,
  editorError,
  showCategoryCreator,
  newCategory,
  isAddingCategory,
  onNewCategoryChange,
  onAddCategory,
}: WorksInlineEditorProps) {
  if (!isEditMode) {
    return null;
  }

  return (
    <section className="works-inline-editor" aria-label="Workspace edit status">
      {isEditorLoading ? <EditorStatus as="p">Loading editor data...</EditorStatus> : null}
      {activeFilter !== "all" ? (
        <EditorStatus as="p">
          Switch filter to all to drag reorder the global project list.
        </EditorStatus>
      ) : null}
      {editorStatus ? <EditorStatus as="p">{editorStatus}</EditorStatus> : null}
      {editorError ? <EditorStatus as="p" tone="error">{editorError}</EditorStatus> : null}

      {showCategoryCreator ? (
        <div className="project-thumbnails__category-create">
          <EditorInput
            className="project-thumbnails__category-input"
            value={newCategory}
            onChange={(event) => onNewCategoryChange(event.target.value)}
            placeholder="new category"
          />
          <EditorButton disabled={isAddingCategory} onClick={onAddCategory}>
            {isAddingCategory ? "adding..." : "add"}
          </EditorButton>
        </div>
      ) : null}
    </section>
  );
}
