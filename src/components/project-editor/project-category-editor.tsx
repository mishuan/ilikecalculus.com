"use client";

import {
  EditorButton,
  EditorChip,
  EditorInput,
} from "@/components/ui/editor-controls";

type ProjectCategoryEditorProps = {
  isEditMode: boolean;
  availableCategories: string[];
  selectedCategories: string[];
  showCategoryCreator: boolean;
  newCategoryDraft: string;
  isAddingCategory: boolean;
  onToggleCategory: (category: string) => void;
  onToggleCategoryCreator: () => void;
  onNewCategoryDraftChange: (value: string) => void;
  onAddCategory: () => void;
};

export function ProjectCategoryEditor({
  isEditMode,
  availableCategories,
  selectedCategories,
  showCategoryCreator,
  newCategoryDraft,
  isAddingCategory,
  onToggleCategory,
  onToggleCategoryCreator,
  onNewCategoryDraftChange,
  onAddCategory,
}: ProjectCategoryEditorProps) {
  if (!isEditMode) {
    return null;
  }

  return (
    <div className="project-thumbnails__category-row">
      <div className="project-thumbnails__category-list">
        {availableCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <EditorChip
              key={category}
              selected={isSelected}
              onClick={() => onToggleCategory(category)}
            >
              {category}
            </EditorChip>
          );
        })}
        <EditorChip
          add
          aria-label="Add category"
          onClick={onToggleCategoryCreator}
        >
          +
        </EditorChip>
      </div>

      {showCategoryCreator ? (
        <div className="project-thumbnails__category-create">
          <EditorInput
            className="project-thumbnails__category-input"
            value={newCategoryDraft}
            onChange={(event) => onNewCategoryDraftChange(event.target.value)}
            placeholder="new category"
          />
          <EditorButton disabled={isAddingCategory} onClick={onAddCategory}>
            {isAddingCategory ? "adding..." : "add"}
          </EditorButton>
        </div>
      ) : null}
    </div>
  );
}
