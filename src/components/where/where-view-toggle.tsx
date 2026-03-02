"use client";

import { SegmentedTextToggle } from "@/components/ui/segmented-text-toggle";

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
  const options = VIEW_OPTIONS.map((option) => ({
    ...option,
    onSelect: onChange,
  }));

  return (
    <SegmentedTextToggle
      value={value}
      options={options}
      ariaLabel="Timeline view"
      testId="where-view-toggle"
      className="where-timeline__view-switch"
      itemWrapClassName="where-timeline__view-item-wrap"
      itemClassName="where-timeline__view-item"
      separatorClassName="where-timeline__view-separator"
    />
  );
}
