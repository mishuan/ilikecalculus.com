"use client";

import { Fragment } from "react";
import { EditorChip } from "@/components/ui/editor-controls";
import { TextActionButton } from "@/components/ui/text-action";

type WorksFilterOption = {
  value: string | "all";
  label: string;
};

type WorksFilterBarProps = {
  isEditMode: boolean;
  activeFilter: string | "all";
  availableCategories: string[];
  filterOptions: WorksFilterOption[];
  labelForCategory: (category: string) => string;
  canReorderCategories: boolean;
  draggingCategory: string | null;
  onFilterChange: (value: string | "all") => void;
  onCategoryDragStart: (category: string) => void;
  onCategoryDrop: (targetCategory: string) => void;
  onCategoryDragEnd: () => void;
  onToggleCategoryCreator: () => void;
};

export function WorksFilterBar({
  isEditMode,
  activeFilter,
  availableCategories,
  filterOptions,
  labelForCategory,
  canReorderCategories,
  draggingCategory,
  onFilterChange,
  onCategoryDragStart,
  onCategoryDrop,
  onCategoryDragEnd,
  onToggleCategoryCreator,
}: WorksFilterBarProps) {
  return (
    <header className="works-intro">
      <h1 className="works-intro__title">works</h1>
      {isEditMode ? (
        <div className="works-intro__nav works-intro__nav--edit" role="group" aria-label="work filters">
          <EditorChip
            selected={activeFilter === "all"}
            aria-pressed={activeFilter === "all"}
            onClick={() => onFilterChange("all")}
          >
            all
          </EditorChip>

          {availableCategories.map((category) => (
            <EditorChip
              key={category}
              selected={activeFilter === category}
              aria-pressed={activeFilter === category}
              draggable={canReorderCategories}
              onClick={() => onFilterChange(category)}
              onDragStart={() => {
                if (!canReorderCategories) {
                  return;
                }
                onCategoryDragStart(category);
              }}
              onDragOver={(event) => {
                if (!canReorderCategories || !draggingCategory || draggingCategory === category) {
                  return;
                }
                event.preventDefault();
              }}
              onDrop={() => onCategoryDrop(category)}
              onDragEnd={onCategoryDragEnd}
            >
              {labelForCategory(category)}
              <span className="works-edit-chip__drag">::</span>
            </EditorChip>
          ))}

          <EditorChip add aria-label="Add category" onClick={onToggleCategoryCreator}>
            +
          </EditorChip>
        </div>
      ) : (
        <div className="works-intro__nav" role="group" aria-label="work filters">
          {filterOptions.map((option, index) => (
            <Fragment key={option.value}>
              {index > 0 ? <span className="works-intro__separator" aria-hidden="true">-</span> : null}
              <TextActionButton
                className="works-intro__link"
                tone={activeFilter === option.value ? "default" : "muted"}
                underline={activeFilter === option.value ? "underline" : "hover"}
                onClick={() => onFilterChange(option.value)}
              >
                {option.label}
              </TextActionButton>
            </Fragment>
          ))}
        </div>
      )}
    </header>
  );
}
