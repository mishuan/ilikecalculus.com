"use client";

import { useMemo } from "react";
import type { ResolvedWhereLocation } from "@/components/where/use-where-state";
import { classNames } from "@/components/ui/class-names";

type WhereMapProps = {
  locations: ResolvedWhereLocation[];
  selectedLocationId: string | null;
  latestPastLocationId: string | null;
  onSelectLocation: (id: string) => void;
};

const MAP_WIDTH = 980;
const MAP_HEIGHT = 520;
type CoordinatePair = readonly [latitude: number, longitude: number];
const CONTINENT_POLYGONS: ReadonlyArray<ReadonlyArray<CoordinatePair>> = [
  [
    [72, -168],
    [67, -148],
    [58, -132],
    [50, -126],
    [42, -124],
    [31, -116],
    [22, -105],
    [18, -92],
    [24, -80],
    [34, -75],
    [46, -66],
    [56, -76],
    [64, -96],
    [70, -120],
  ],
  [
    [82, -52],
    [76, -39],
    [68, -26],
    [60, -42],
    [67, -56],
  ],
  [
    [12, -81],
    [7, -74],
    [-5, -70],
    [-17, -64],
    [-31, -59],
    [-40, -66],
    [-53, -73],
    [-55, -64],
    [-45, -55],
    [-30, -50],
    [-14, -47],
    [-3, -55],
    [7, -63],
  ],
  [
    [72, -10],
    [66, 12],
    [62, 35],
    [58, 62],
    [53, 84],
    [47, 106],
    [41, 126],
    [35, 142],
    [26, 150],
    [22, 134],
    [16, 106],
    [10, 76],
    [16, 53],
    [30, 35],
    [40, 22],
    [48, 10],
    [55, 2],
    [61, -8],
  ],
  [
    [36, -18],
    [31, -2],
    [26, 14],
    [14, 30],
    [1, 39],
    [-16, 33],
    [-28, 24],
    [-35, 16],
    [-35, 5],
    [-26, -4],
    [-11, -9],
    [6, -9],
    [20, -7],
    [30, -11],
  ],
  [
    [-10, 112],
    [-19, 124],
    [-29, 138],
    [-37, 147],
    [-44, 136],
    [-40, 122],
    [-30, 114],
    [-19, 111],
  ],
  [
    [-62, -180],
    [-58, -130],
    [-60, -60],
    [-62, 15],
    [-60, 110],
    [-62, 180],
    [-76, 180],
    [-76, -180],
  ],
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function project(latitude: number, longitude: number) {
  return {
    x: ((longitude + 180) / 360) * MAP_WIDTH,
    y: ((90 - latitude) / 180) * MAP_HEIGHT,
  };
}

function polygonPath(points: ReadonlyArray<CoordinatePair>) {
  const projected = points.map(([latitude, longitude]) => project(latitude, longitude));
  if (projected.length === 0) {
    return "";
  }

  const [first, ...rest] = projected;
  const commands = [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`];

  for (const point of rest) {
    commands.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  }

  commands.push("Z");
  return commands.join(" ");
}

export function WhereMap({
  locations,
  selectedLocationId,
  latestPastLocationId,
  onSelectLocation,
}: WhereMapProps) {
  const pointsById = useMemo(
    () =>
      new Map(
        locations.map((location) => [
          location.id,
          {
            ...project(location.latitude, location.longitude),
            location,
          },
        ]),
      ),
    [locations],
  );

  const selectedPoint = selectedLocationId ? pointsById.get(selectedLocationId) : null;
  const focusScale = selectedPoint ? 1.14 : 1;

  const focusTransform = useMemo(() => {
    if (!selectedPoint) {
      return "translate(0 0) scale(1)";
    }

    const targetX = MAP_WIDTH * 0.5 - selectedPoint.x * focusScale;
    const targetY = MAP_HEIGHT * 0.5 - selectedPoint.y * focusScale;
    const minX = MAP_WIDTH - MAP_WIDTH * focusScale;
    const minY = MAP_HEIGHT - MAP_HEIGHT * focusScale;
    const translateX = clamp(targetX, minX, 0);
    const translateY = clamp(targetY, minY, 0);

    return `translate(${translateX} ${translateY}) scale(${focusScale})`;
  }, [focusScale, selectedPoint]);

  const segments = useMemo(() => {
    const totalSegments = Math.max(locations.length - 1, 1);

    return locations.slice(0, -1).map((from, index) => {
      const to = locations[index + 1];
      const fromPoint = pointsById.get(from.id);
      const toPoint = pointsById.get(to.id);
      if (!fromPoint || !toPoint) {
        return null;
      }

      const intensity = totalSegments <= 1 ? 1 : (index + 1) / totalSegments;
      const selected = selectedLocationId === from.id || selectedLocationId === to.id;

      return {
        key: `${from.id}-${to.id}`,
        from: fromPoint,
        to: toPoint,
        intensity,
        selected,
        upcoming: from.isFuture || to.isFuture,
      };
    }).filter((segment): segment is NonNullable<typeof segment> => Boolean(segment));
  }, [locations, pointsById, selectedLocationId]);

  return (
    <section className="where-map-panel">
      <header className="where-map-panel__header">
        <h2 className="where-map-panel__title">map</h2>
      </header>

      <div className="where-map">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label="Map of visited and upcoming locations"
        >
          <defs>
            <linearGradient id="where-map-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--paper) 92%, white)" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--bg) 82%, var(--paper))" />
            </linearGradient>
          </defs>

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#where-map-bg)" />

          <g className="where-map__graticule" aria-hidden="true">
            {[-60, -30, 0, 30, 60].map((latitude) => {
              const y = project(latitude, 0).y;
              return <line key={`lat-${latitude}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y} />;
            })}
            {[-120, -60, 0, 60, 120].map((longitude) => {
              const x = project(0, longitude).x;
              return <line key={`lng-${longitude}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT} />;
            })}
          </g>

          <g className="where-map__content" transform={focusTransform}>
            <g className="where-map__land" aria-hidden="true">
              {CONTINENT_POLYGONS.map((continent, index) => (
                <path key={`continent-${index}`} d={polygonPath(continent)} />
              ))}
            </g>

            {segments.map((segment) => (
              <line
                key={segment.key}
                x1={segment.from.x}
                y1={segment.from.y}
                x2={segment.to.x}
                y2={segment.to.y}
                className={classNames(
                  "where-map__segment",
                  segment.upcoming && "where-map__segment--upcoming",
                  segment.selected && "where-map__segment--selected",
                )}
                style={{
                  opacity: String(0.24 + segment.intensity * 0.56 + (segment.selected ? 0.1 : 0)),
                  strokeWidth: `${1 + segment.intensity * 2 + (segment.selected ? 0.8 : 0)}px`,
                }}
              />
            ))}

            {locations.map((location) => {
              const point = pointsById.get(location.id);
              if (!point) {
                return null;
              }

              const isSelected = selectedLocationId === location.id;
              const isLatestPast = latestPastLocationId === location.id;

              return (
                <g key={location.id}>
                  {isLatestPast ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={10.8}
                      className="where-map__marker-ring where-map__marker-ring--latest"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isSelected ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={8.2}
                      className="where-map__marker-ring where-map__marker-ring--selected"
                      aria-hidden="true"
                    />
                  ) : null}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isLatestPast ? 5.7 : isSelected ? 4.8 : 3.8}
                    className={classNames(
                      "where-map__marker",
                      isLatestPast && "where-map__marker--latest",
                      location.isFuture && "where-map__marker--future",
                    )}
                    onClick={() => onSelectLocation(location.id)}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {locations.length === 0 ? (
          <p className="where-map__empty">Add locations to start drawing your route.</p>
        ) : null}
      </div>
    </section>
  );
}
