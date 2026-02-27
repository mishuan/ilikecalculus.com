"use client";

import { TextActionButton } from "@/components/ui/text-action";

export type WhereTimelineViewMode = "list" | "calendar";

type WhereViewToggleProps = {
  value: WhereTimelineViewMode;
  onChange: (nextValue: WhereTimelineViewMode) => void;
};

const VIEW_OPTIONS: Array<{ value: WhereTimelineViewMode; label: string; testId: string }> = [
  {
    value: "list",
    label: "list",
    testId: "where-view-list",
  },
  {
    value: "calendar",
    label: "calendar",
    testId: "where-view-calendar",
  },
];

export function WhereViewToggle({ value, onChange }: WhereViewToggleProps) {
  return (
    <div
      className="where-timeline__view-switch"
      data-testid="where-view-toggle"
      role="group"
      aria-label="Timeline view"
    >
      {VIEW_OPTIONS.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <span key={option.value} className="where-timeline__view-item-wrap">
            <TextActionButton
              type="button"
              className="where-timeline__view-item"
              underline={isSelected ? "underline" : "hover"}
              aria-pressed={isSelected}
              data-testid={option.testId}
              onClick={() => {
                onChange(option.value);
              }}
            >
              {option.label}
            </TextActionButton>
            {index < VIEW_OPTIONS.length - 1 ? (
              <span className="where-timeline__view-separator" aria-hidden="true">
                /
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
