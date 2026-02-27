"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { classNames } from "@/components/ui/class-names";
import { TextActionButton } from "@/components/ui/text-action";
import {
  addMonths,
  fromDayKey,
  startOfMonth,
  toDayKey,
  toMonthKey,
} from "@/components/where/where-date-utils";
import { createHoverIntent } from "@/components/where/where-hover-intent";
import type { ResolvedWhereLocation } from "@/components/where/use-where-state";

type WhereCalendarProps = {
  locations: ResolvedWhereLocation[];
  selectedLocationId: string | null;
  hoveredLocationId: string | null;
  onSelectLocation: (id: string) => void;
  onHoverLocation: (id: string | null) => void;
  registerEntryRef: (id: string, node: HTMLElement | null) => void;
};

const WEEKDAY_LABELS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type CalendarCell = {
  key: string;
  dayKey: string | null;
  dayNumber: number | null;
};

function resolveDayLocation(dayLocations: ResolvedWhereLocation[], preferredLocationId?: string | null) {
  if (dayLocations.length === 0) {
    return null;
  }

  if (preferredLocationId) {
    const preferred = dayLocations.find((location) => location.id === preferredLocationId);
    if (preferred) {
      return preferred;
    }
  }

  return dayLocations[dayLocations.length - 1];
}

export function WhereCalendar({
  locations,
  selectedLocationId,
  hoveredLocationId,
  onSelectLocation,
  onHoverLocation,
  registerEntryRef,
}: WhereCalendarProps) {
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }),
    [],
  );
  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
      }),
    [],
  );
  const rowDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  const sortedLocations = useMemo(
    () =>
      [...locations].sort((a, b) => {
        if (a.atMs === b.atMs) {
          return a.id.localeCompare(b.id);
        }
        return a.atMs - b.atMs;
      }),
    [locations],
  );

  const locationsByDayKey = useMemo(() => {
    const map = new Map<string, ResolvedWhereLocation[]>();
    for (const location of sortedLocations) {
      const dayKey = toDayKey(new Date(location.at));
      const existing = map.get(dayKey);
      if (existing) {
        existing.push(location);
      } else {
        map.set(dayKey, [location]);
      }
    }
    return map;
  }, [sortedLocations]);

  const selectedLocation = useMemo(
    () => sortedLocations.find((location) => location.id === selectedLocationId) ?? null,
    [selectedLocationId, sortedLocations],
  );

  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(new Date()));
  const syncedSelectionForMonthRef = useRef<string | null>(selectedLocationId);

  useEffect(() => {
    if (syncedSelectionForMonthRef.current === selectedLocationId) {
      return;
    }

    syncedSelectionForMonthRef.current = selectedLocationId;
    if (!selectedLocation) {
      return;
    }

    const selectedMonth = startOfMonth(new Date(selectedLocation.at));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- selection changes should open that month.
    setVisibleMonth(selectedMonth);
  }, [selectedLocation, selectedLocationId]);

  const monthKey = toMonthKey(visibleMonth);
  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);
  const syncedSelectionForDayRef = useRef<string | null>(selectedLocationId);

  const firstDayWithEntriesInMonth = useMemo(() => {
    for (const location of sortedLocations) {
      const date = new Date(location.at);
      if (toMonthKey(date) === monthKey) {
        return toDayKey(date);
      }
    }
    return null;
  }, [monthKey, sortedLocations]);

  useEffect(() => {
    const selectionChanged = syncedSelectionForDayRef.current !== selectedLocationId;
    if (selectionChanged) {
      syncedSelectionForDayRef.current = selectedLocationId;
    }

    const selectedDayKey = selectedLocation ? toDayKey(new Date(selectedLocation.at)) : null;
    if (
      selectionChanged &&
      selectedDayKey &&
      selectedDayKey.startsWith(monthKey) &&
      locationsByDayKey.has(selectedDayKey)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- selection changes should reveal matching day entries.
      setActiveDayKey(selectedDayKey);
      return;
    }

    if (activeDayKey && activeDayKey.startsWith(monthKey) && locationsByDayKey.has(activeDayKey)) {
      return;
    }

    setActiveDayKey(firstDayWithEntriesInMonth);
  }, [activeDayKey, firstDayWithEntriesInMonth, locationsByDayKey, monthKey, selectedLocation, selectedLocationId]);

  const gridCells = useMemo<CalendarCell[]>(() => {
    const monthStart = startOfMonth(visibleMonth);
    const leadingEmptyCount = monthStart.getDay();
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let index = 0; index < leadingEmptyCount; index += 1) {
      cells.push({
        key: `empty-leading-${index}`,
        dayKey: null,
        dayNumber: null,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      cells.push({
        key: `day-${toDayKey(date)}`,
        dayKey: toDayKey(date),
        dayNumber: day,
      });
    }

    const trailingEmptyCount = (7 - (cells.length % 7)) % 7;
    for (let index = 0; index < trailingEmptyCount; index += 1) {
      cells.push({
        key: `empty-trailing-${index}`,
        dayKey: null,
        dayNumber: null,
      });
    }

    return cells;
  }, [visibleMonth]);
  const weekRows = useMemo(() => {
    const rows: CalendarCell[][] = [];
    for (let index = 0; index < gridCells.length; index += 7) {
      rows.push(gridCells.slice(index, index + 7));
    }
    return rows;
  }, [gridCells]);

  const monthLocations = useMemo(
    () =>
      sortedLocations
        .filter((location) => toMonthKey(new Date(location.at)) === monthKey)
        .slice()
        .sort((a, b) => {
          if (a.atMs === b.atMs) {
            return a.id.localeCompare(b.id);
          }
          return b.atMs - a.atMs;
        }),
    [monthKey, sortedLocations],
  );

  return (
    <div className="where-calendar" data-testid="where-calendar">
      <div className="where-calendar__header">
        <TextActionButton
          type="button"
          className="where-calendar__month-nav"
          underline="hover"
          aria-label="Previous month"
          onClick={() => {
            setVisibleMonth((current) => addMonths(current, -1));
          }}
        >
          prev
        </TextActionButton>
        <p className="where-calendar__month-label">{monthFormatter.format(visibleMonth)}</p>
        <TextActionButton
          type="button"
          className="where-calendar__month-nav"
          underline="hover"
          aria-label="Next month"
          onClick={() => {
            setVisibleMonth((current) => addMonths(current, 1));
          }}
        >
          next
        </TextActionButton>
      </div>

      <div className="where-calendar__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="where-calendar__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="where-calendar__grid" role="grid" aria-label="Location calendar">
        {weekRows.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="where-calendar__week" role="row">
            {week.map((cell) => {
              if (!cell.dayKey || !cell.dayNumber) {
                return (
                  <div key={cell.key} className="where-calendar__day where-calendar__day--empty" aria-hidden="true" />
                );
              }

              const dayLocations = locationsByDayKey.get(cell.dayKey) ?? [];
              const isActiveDay = activeDayKey === cell.dayKey;
              const hasSelected = dayLocations.some((location) => location.id === selectedLocationId);
              const hasHovered = dayLocations.some((location) => location.id === hoveredLocationId);
              const isInteractive = dayLocations.length > 0;
              const primaryDayLocation = resolveDayLocation(dayLocations, selectedLocationId);
              const locationLabelText = dayLocations.map((location) => location.label).join(" · ");
              const hoverIntent = createHoverIntent({
                locationId: primaryDayLocation?.id ?? "",
                hoveredLocationId,
                onHoverLocation,
                disabled: !isInteractive || !primaryDayLocation,
                onActivate: () => {
                  setHoveredDayKey(cell.dayKey);
                },
                onClear: () => {
                  if (hoveredDayKey === cell.dayKey) {
                    setHoveredDayKey(null);
                  }
                },
              });

              return (
                <button
                  key={cell.key}
                  type="button"
                  role="gridcell"
                  className={classNames(
                    "where-calendar__day",
                    isInteractive && "where-calendar__day--has-items",
                    isActiveDay && "where-calendar__day--active",
                    hasSelected && "where-calendar__day--selected",
                    hasHovered && "where-calendar__day--hovered",
                  )}
                  disabled={!isInteractive}
                  onPointerEnter={hoverIntent.activate}
                  onPointerLeave={hoverIntent.clear}
                  onFocus={hoverIntent.activate}
                  onBlur={hoverIntent.clear}
                  onClick={() => {
                    setActiveDayKey(cell.dayKey);
                    if (primaryDayLocation) {
                      onSelectLocation(primaryDayLocation.id);
                    }
                  }}
                  aria-label={
                    dayLocations.length > 0
                      ? `${dayFormatter.format(fromDayKey(cell.dayKey))}, ${locationLabelText}`
                      : dayFormatter.format(fromDayKey(cell.dayKey))
                  }
                  data-preview-location-id={primaryDayLocation?.id ?? ""}
                  data-testid={`where-calendar-day-${cell.dayKey}`}
                >
                  <span className="where-calendar__day-number">{cell.dayNumber}</span>
                  {dayLocations.length > 0 ? (
                    <span className="where-calendar__day-location" aria-hidden="true">
                      {locationLabelText}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="where-calendar__drilldown">
        {monthLocations.length === 0 ? (
          <p className="where-calendar__empty">No locations in this month.</p>
        ) : (
          <div className="where-entry-list where-calendar__drilldown-list">
            {monthLocations.map((location, index) => {
              const isSelected = selectedLocationId === location.id;
              const isHovered = hoveredLocationId === location.id;
              const shouldShowSelectedPreview = Boolean(location.note) && isSelected;
              const shouldShowHoverPreview = Boolean(location.note) && isHovered && !isSelected;
              const hoverIntent = createHoverIntent({
                locationId: location.id,
                hoveredLocationId,
                onHoverLocation,
                onActivate: () => {
                  setHoveredDayKey(toDayKey(new Date(location.at)));
                },
              });

              return (
                <article
                  key={location.id}
                  ref={(node) => {
                    registerEntryRef(location.id, node);
                  }}
                  className={classNames(
                    "where-entry",
                    location.isFuture && "where-entry--future",
                    isSelected && "where-entry--selected",
                    isHovered && "where-entry--hovered",
                    index === 0 && "where-entry--hover-note-below",
                  )}
                  data-testid={`where-calendar-entry-${location.id}`}
                >
                  <button
                    type="button"
                    className="where-entry__main"
                    onPointerEnter={hoverIntent.activate}
                    onPointerLeave={hoverIntent.clear}
                    onFocus={hoverIntent.activate}
                    onBlur={hoverIntent.clear}
                    onClick={() => {
                      onSelectLocation(location.id);
                      setActiveDayKey(toDayKey(new Date(location.at)));
                    }}
                  >
                    <p className="where-entry__label">{location.label}</p>
                    <p className="where-entry__time">{rowDateFormatter.format(new Date(location.at))}</p>
                    {shouldShowSelectedPreview ? <p className="where-entry__note">{location.note}</p> : null}
                  </button>
                  {shouldShowHoverPreview ? <p className="where-entry__hover-note">{location.note}</p> : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
