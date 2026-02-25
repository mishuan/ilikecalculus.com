"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    [69, -160],
    [66, -150],
    [62, -141],
    [58, -136],
    [55, -130],
    [51, -127],
    [48, -125],
    [45, -123],
    [42, -124],
    [38, -122],
    [35, -119],
    [33, -116],
    [31, -114],
    [28, -112],
    [26, -109],
    [24, -106],
    [22, -102],
    [20, -98],
    [19, -94],
    [19, -90],
    [21, -86],
    [24, -83],
    [27, -81],
    [30, -80],
    [32, -78],
    [35, -77],
    [40, -74],
    [44, -69],
    [48, -63],
    [52, -61],
    [56, -64],
    [60, -70],
    [63, -79],
    [66, -88],
    [69, -100],
    [71, -114],
    [72, -130],
  ],
  [
    [83, -74],
    [81, -62],
    [79, -50],
    [76, -40],
    [72, -32],
    [68, -28],
    [64, -34],
    [60, -43],
    [60, -52],
    [63, -59],
    [68, -65],
    [74, -69],
  ],
  [
    [12, -81],
    [10, -78],
    [8, -76],
    [6, -74],
    [3, -72],
    [0, -71],
    [-4, -70],
    [-8, -70],
    [-12, -69],
    [-16, -68],
    [-20, -66],
    [-24, -64],
    [-28, -62],
    [-33, -60],
    [-37, -58],
    [-41, -59],
    [-45, -62],
    [-50, -67],
    [-54, -71],
    [-56, -67],
    [-54, -61],
    [-50, -56],
    [-45, -52],
    [-39, -49],
    [-33, -48],
    [-26, -50],
    [-18, -54],
    [-11, -58],
    [-5, -61],
    [0, -62],
    [4, -64],
    [7, -67],
    [10, -72],
  ],
  [
    [72, -12],
    [71, -3],
    [70, 8],
    [70, 20],
    [69, 32],
    [68, 44],
    [67, 56],
    [66, 68],
    [64, 80],
    [62, 92],
    [60, 104],
    [58, 116],
    [55, 128],
    [50, 140],
    [45, 150],
    [40, 156],
    [34, 152],
    [29, 145],
    [24, 139],
    [20, 132],
    [16, 125],
    [12, 118],
    [8, 110],
    [6, 102],
    [8, 94],
    [11, 88],
    [16, 82],
    [20, 77],
    [22, 72],
    [24, 66],
    [26, 60],
    [28, 54],
    [31, 48],
    [34, 42],
    [37, 36],
    [41, 30],
    [44, 24],
    [47, 18],
    [50, 12],
    [53, 6],
    [56, 2],
    [58, -3],
    [60, -7],
    [63, -10],
    [66, -12],
    [69, -14],
  ],
  [
    [37, -18],
    [34, -10],
    [33, -2],
    [33, 8],
    [32, 18],
    [30, 27],
    [27, 33],
    [23, 36],
    [19, 40],
    [14, 43],
    [9, 46],
    [3, 45],
    [-2, 42],
    [-7, 39],
    [-12, 36],
    [-17, 33],
    [-22, 30],
    [-27, 26],
    [-31, 22],
    [-34, 17],
    [-35, 11],
    [-34, 5],
    [-32, 0],
    [-29, -4],
    [-24, -7],
    [-18, -9],
    [-12, -11],
    [-6, -12],
    [0, -12],
    [6, -10],
    [12, -8],
    [18, -6],
    [23, -5],
    [28, -7],
    [32, -10],
    [35, -14],
  ],
  [
    [31, 35],
    [28, 38],
    [24, 43],
    [20, 49],
    [16, 54],
    [13, 53],
    [12, 47],
    [14, 43],
    [18, 40],
    [23, 37],
    [28, 35],
  ],
  [
    [28, 67],
    [25, 72],
    [22, 76],
    [20, 80],
    [18, 84],
    [15, 87],
    [12, 89],
    [9, 86],
    [8, 82],
    [10, 78],
    [14, 74],
    [19, 71],
    [23, 69],
  ],
  [
    [59, -8],
    [57, -5],
    [55, -3],
    [53, -4],
    [51, -6],
    [52, -8],
    [55, -9],
  ],
  [
    [45, 141],
    [42, 144],
    [38, 142],
    [35, 139],
    [33, 136],
    [36, 134],
    [40, 136],
    [43, 139],
  ],
  [
    [-10, 112],
    [-14, 116],
    [-18, 121],
    [-22, 126],
    [-26, 131],
    [-30, 136],
    [-34, 141],
    [-38, 146],
    [-42, 145],
    [-44, 139],
    [-43, 132],
    [-40, 125],
    [-36, 119],
    [-31, 114],
    [-25, 111],
    [-19, 110],
    [-13, 110],
  ],
  [
    [-3, 141],
    [-4, 147],
    [-6, 153],
    [-8, 151],
    [-9, 146],
    [-8, 142],
    [-6, 140],
  ],
  [
    [-12, 45],
    [-15, 48],
    [-20, 50],
    [-24, 49],
    [-26, 46],
    [-24, 44],
    [-20, 43],
    [-16, 44],
  ],
  [
    [-34, 166],
    [-38, 174],
    [-42, 178],
    [-46, 173],
    [-45, 168],
    [-40, 165],
  ],
  [
    [-62, -180],
    [-60, -160],
    [-61, -140],
    [-63, -120],
    [-62, -100],
    [-64, -80],
    [-63, -60],
    [-65, -40],
    [-64, -20],
    [-66, 0],
    [-64, 20],
    [-65, 40],
    [-63, 60],
    [-64, 80],
    [-62, 100],
    [-63, 120],
    [-61, 140],
    [-62, 160],
    [-63, 180],
    [-76, 180],
    [-76, -180],
  ],
];

type SegmentPiece = {
  from: ReturnType<typeof project>;
  to: ReturnType<typeof project>;
};

type MapView = {
  scale: number;
  translateX: number;
  translateY: number;
};

type PointerSample = {
  x: number;
  y: number;
};

type PinchGesture = {
  startDistance: number;
  startScale: number;
  anchorX: number;
  anchorY: number;
};

const MIN_CAMERA_SCALE = 1;
const MAX_CAMERA_SCALE = 6;
const WHEEL_ZOOM_SPEED = 0.0017;
const CLICK_SUPPRESS_MS = 160;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampView(view: MapView): MapView {
  const nextScale = clamp(view.scale, MIN_CAMERA_SCALE, MAX_CAMERA_SCALE);
  const minX = MAP_WIDTH - MAP_WIDTH * nextScale;
  const minY = MAP_HEIGHT - MAP_HEIGHT * nextScale;

  return {
    scale: nextScale,
    translateX: clamp(view.translateX, minX, 0),
    translateY: clamp(view.translateY, minY, 0),
  };
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

function routeSegmentPieces(from: ResolvedWhereLocation, to: ResolvedWhereLocation): SegmentPiece[] {
  const startLat = from.latitude;
  const startLon = from.longitude;
  const endLat = to.latitude;
  const endLon = to.longitude;
  const rawDiff = endLon - startLon;

  if (Math.abs(rawDiff) <= 180) {
    return [
      {
        from: project(startLat, startLon),
        to: project(endLat, endLon),
      },
    ];
  }

  const wrappedEndLon = rawDiff > 0 ? endLon - 360 : endLon + 360;
  const boundaryLon = rawDiff > 0 ? -180 : 180;
  const interpolation = clamp((boundaryLon - startLon) / (wrappedEndLon - startLon), 0, 1);
  const boundaryLat = startLat + (endLat - startLat) * interpolation;
  const oppositeBoundaryLon = -boundaryLon;

  return [
    {
      from: project(startLat, startLon),
      to: project(boundaryLat, boundaryLon),
    },
    {
      from: project(boundaryLat, oppositeBoundaryLon),
      to: project(endLat, endLon),
    },
  ];
}

export function WhereMap({
  locations,
  selectedLocationId,
  latestPastLocationId,
  onSelectLocation,
}: WhereMapProps) {
  const { latestArrivalKey, nextUpcomingKey, nextUpcomingLocationId } = useMemo(() => {
    if (!latestPastLocationId) {
      return { latestArrivalKey: null, nextUpcomingKey: null, nextUpcomingLocationId: null } as const;
    }

    const latestIndex = locations.findIndex((location) => location.id === latestPastLocationId);
    if (latestIndex < 0) {
      return { latestArrivalKey: null, nextUpcomingKey: null, nextUpcomingLocationId: null } as const;
    }

    const latestLocation = locations[latestIndex];
    const previousLocation = latestIndex > 0 ? locations[latestIndex - 1] : null;
    const nextLocation = latestIndex < locations.length - 1 ? locations[latestIndex + 1] : null;

    return {
      latestArrivalKey:
        previousLocation && latestLocation ? `${previousLocation.id}-${latestLocation.id}` : null,
      nextUpcomingKey:
        latestLocation && nextLocation && nextLocation.isFuture
          ? `${latestLocation.id}-${nextLocation.id}`
          : null,
      nextUpcomingLocationId: nextLocation?.isFuture ? nextLocation.id : null,
    } as const;
  }, [latestPastLocationId, locations]);

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

  const mapRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef<Map<number, PointerSample>>(new Map());
  const panPointerIdRef = useRef<number | null>(null);
  const panLastRef = useRef<PointerSample | null>(null);
  const pinchRef = useRef<PinchGesture | null>(null);
  const suppressClickUntilRef = useRef(0);
  const [isPanning, setIsPanning] = useState(false);

  const selectedPoint = selectedLocationId ? pointsById.get(selectedLocationId) : null;

  const baseView = useMemo<MapView>(() => {
    if (!selectedPoint) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    const focusScale = 1.14;
    const targetX = MAP_WIDTH * 0.5 - selectedPoint.x * focusScale;
    const targetY = MAP_HEIGHT * 0.5 - selectedPoint.y * focusScale;

    return clampView({
      scale: focusScale,
      translateX: targetX,
      translateY: targetY,
    });
  }, [selectedPoint]);

  const [view, setView] = useState<MapView>(baseView);
  const viewRef = useRef<MapView>(view);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const mapTransform = useMemo(
    () => `translate(${view.translateX} ${view.translateY}) scale(${view.scale})`,
    [view.scale, view.translateX, view.translateY],
  );

  function toMapCoordinates(clientX: number, clientY: number) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    return {
      x: ((clientX - rect.left) / rect.width) * MAP_WIDTH,
      y: ((clientY - rect.top) / rect.height) * MAP_HEIGHT,
      unitsPerPixelX: MAP_WIDTH / rect.width,
      unitsPerPixelY: MAP_HEIGHT / rect.height,
    };
  }

  useEffect(() => {
    const mapNode = mapRef.current;
    if (!mapNode) {
      return;
    }

    function onWheel(event: WheelEvent) {
      const rect = mapNode?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const mapX = ((event.clientX - rect.left) / rect.width) * MAP_WIDTH;
      const mapY = ((event.clientY - rect.top) / rect.height) * MAP_HEIGHT;
      const unitsPerPixelX = MAP_WIDTH / rect.width;
      const unitsPerPixelY = MAP_HEIGHT / rect.height;
      const currentView = viewRef.current;

      event.preventDefault();

      if (!event.ctrlKey && !event.metaKey && currentView.scale > MIN_CAMERA_SCALE + 0.01) {
        const nextView = clampView({
          scale: currentView.scale,
          translateX: currentView.translateX - event.deltaX * unitsPerPixelX,
          translateY: currentView.translateY - event.deltaY * unitsPerPixelY,
        });

        viewRef.current = nextView;
        setView(nextView);
        return;
      }

      const nextScale = clamp(
        currentView.scale * Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED),
        MIN_CAMERA_SCALE,
        MAX_CAMERA_SCALE,
      );
      const anchorX = (mapX - currentView.translateX) / currentView.scale;
      const anchorY = (mapY - currentView.translateY) / currentView.scale;
      const nextView = clampView({
        scale: nextScale,
        translateX: mapX - anchorX * nextScale,
        translateY: mapY - anchorY * nextScale,
      });

      viewRef.current = nextView;
      setView(nextView);
    }

    mapNode.addEventListener("wheel", onWheel, { passive: false });
    return () => mapNode.removeEventListener("wheel", onWheel);
  }, []);

  function initializePinchGesture() {
    const activePointers = Array.from(pointersRef.current.values());
    if (activePointers.length < 2) {
      pinchRef.current = null;
      return;
    }

    const first = activePointers[0];
    const second = activePointers[1];
    const distance = Math.hypot(second.x - first.x, second.y - first.y);

    if (distance <= 0) {
      pinchRef.current = null;
      return;
    }

    const midpointClientX = (first.x + second.x) * 0.5;
    const midpointClientY = (first.y + second.y) * 0.5;
    const midpointMap = toMapCoordinates(midpointClientX, midpointClientY);
    if (!midpointMap) {
      pinchRef.current = null;
      return;
    }

    const currentView = viewRef.current;

    pinchRef.current = {
      startDistance: distance,
      startScale: currentView.scale,
      anchorX: (midpointMap.x - currentView.translateX) / currentView.scale,
      anchorY: (midpointMap.y - currentView.translateY) / currentView.scale,
    };
  }

  function releasePointer(pointerId: number) {
    pointersRef.current.delete(pointerId);

    if (pointersRef.current.size >= 2) {
      initializePinchGesture();
      setIsPanning(false);
      return;
    }

    pinchRef.current = null;

    const remainingPointer = Array.from(pointersRef.current.entries())[0];
    if (remainingPointer) {
      panPointerIdRef.current = remainingPointer[0];
      panLastRef.current = remainingPointer[1];
      setIsPanning(false);
      return;
    }

    panPointerIdRef.current = null;
    panLastRef.current = null;
    setIsPanning(false);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);

    if (pointersRef.current.size >= 2) {
      panPointerIdRef.current = null;
      panLastRef.current = null;
      setIsPanning(false);
      initializePinchGesture();
      return;
    }

    panPointerIdRef.current = event.pointerId;
    panLastRef.current = { x: event.clientX, y: event.clientY };
    pinchRef.current = null;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2) {
      if (!pinchRef.current) {
        initializePinchGesture();
      }

      const pinchState = pinchRef.current;
      const activePointers = Array.from(pointersRef.current.values());
      if (!pinchState || activePointers.length < 2) {
        return;
      }

      const first = activePointers[0];
      const second = activePointers[1];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      if (distance <= 0) {
        return;
      }

      const midpointClientX = (first.x + second.x) * 0.5;
      const midpointClientY = (first.y + second.y) * 0.5;
      const midpointMap = toMapCoordinates(midpointClientX, midpointClientY);
      if (!midpointMap) {
        return;
      }

      const nextScale = clamp(
        pinchState.startScale * (distance / pinchState.startDistance),
        MIN_CAMERA_SCALE,
        MAX_CAMERA_SCALE,
      );

      const nextView = clampView({
        scale: nextScale,
        translateX: midpointMap.x - pinchState.anchorX * nextScale,
        translateY: midpointMap.y - pinchState.anchorY * nextScale,
      });

      suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESS_MS;
      viewRef.current = nextView;
      setView(nextView);
      setIsPanning(false);
      return;
    }

    if (panPointerIdRef.current !== event.pointerId || !panLastRef.current) {
      return;
    }

    const currentMapPoint = toMapCoordinates(event.clientX, event.clientY);
    if (!currentMapPoint) {
      return;
    }

    const movementPx = Math.hypot(event.clientX - panLastRef.current.x, event.clientY - panLastRef.current.y);
    const deltaX = (event.clientX - panLastRef.current.x) * currentMapPoint.unitsPerPixelX;
    const deltaY = (event.clientY - panLastRef.current.y) * currentMapPoint.unitsPerPixelY;

    if (movementPx > 1.2) {
      suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESS_MS;
      setIsPanning(true);
    }

    panLastRef.current = { x: event.clientX, y: event.clientY };

    setView((currentView) => {
      const nextView = clampView({
        scale: currentView.scale,
        translateX: currentView.translateX + deltaX,
        translateY: currentView.translateY + deltaY,
      });

      viewRef.current = nextView;
      return nextView;
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    releasePointer(event.pointerId);
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    releasePointer(event.pointerId);
  }

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
      const segmentKey = `${from.id}-${to.id}`;

      return {
        key: segmentKey,
        from: fromPoint,
        to: toPoint,
        intensity,
        selected,
        upcoming: from.isFuture || to.isFuture,
        pieces: routeSegmentPieces(from, to),
        isLatestArrival: latestArrivalKey === segmentKey,
        isNextUpcoming: nextUpcomingKey === segmentKey,
      };
    }).filter((segment): segment is NonNullable<typeof segment> => Boolean(segment));
  }, [latestArrivalKey, locations, nextUpcomingKey, pointsById, selectedLocationId]);

  return (
    <section className="where-map-panel">
      <header className="where-map-panel__header">
        <h2 className="where-map-panel__title">map</h2>
      </header>

      <div
        ref={mapRef}
        className={classNames("where-map", "where-map--interactive", isPanning && "where-map--panning")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
      >
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
            <marker
              id="where-map-upcoming-arrow"
              viewBox="0 0 9 9"
              refX="7.5"
              refY="4.5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 9 4.5 L 0 9 z" fill="color-mix(in srgb, var(--ink) 88%, var(--muted))" />
            </marker>
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

          <g className="where-map__content" transform={mapTransform}>
            <g className="where-map__land" aria-hidden="true">
              {CONTINENT_POLYGONS.map((continent, index) => (
                <path key={`continent-${index}`} d={polygonPath(continent)} />
              ))}
            </g>

            {segments.flatMap((segment) =>
              segment.pieces.map((piece, pieceIndex) => (
                <line
                  key={`${segment.key}-${pieceIndex}`}
                  x1={piece.from.x}
                  y1={piece.from.y}
                  x2={piece.to.x}
                  y2={piece.to.y}
                  markerEnd={
                    segment.isNextUpcoming && pieceIndex === segment.pieces.length - 1
                      ? "url(#where-map-upcoming-arrow)"
                      : undefined
                  }
                  className={classNames(
                    "where-map__segment",
                    segment.upcoming && "where-map__segment--upcoming",
                    segment.selected && "where-map__segment--selected",
                    segment.isLatestArrival && "where-map__segment--latest-arrival",
                    segment.isNextUpcoming && "where-map__segment--next-upcoming",
                  )}
                  style={{
                    opacity: String(0.22 + segment.intensity * 0.45 + (segment.selected ? 0.08 : 0)),
                    strokeWidth: `${0.65 + segment.intensity * 1.35 + (segment.selected ? 0.35 : 0)}px`,
                  }}
                />
              )),
            )}

            {locations.map((location) => {
              const point = pointsById.get(location.id);
              if (!point) {
                return null;
              }

              const isSelected = selectedLocationId === location.id;
              const isLatestPast = latestPastLocationId === location.id;
              const isUpcomingDestination = nextUpcomingLocationId === location.id;

              return (
                <g key={location.id}>
                  {isSelected ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={14.2}
                      className="where-map__marker-halo"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isUpcomingDestination ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={8.2}
                      className="where-map__marker-ring where-map__marker-ring--upcoming-destination"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isSelected ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={11}
                      className="where-map__marker-ring where-map__marker-ring--selected"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isSelected ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={7.4}
                      className="where-map__marker-ring where-map__marker-ring--selected-inner"
                      aria-hidden="true"
                    />
                  ) : null}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isLatestPast ? 5.1 : isSelected ? 5.8 : 3.2}
                    className={classNames(
                      "where-map__marker",
                      isSelected && "where-map__marker--selected",
                      isLatestPast && "where-map__marker--latest",
                      location.isFuture && "where-map__marker--future",
                    )}
                    onClick={() => {
                      if (Date.now() < suppressClickUntilRef.current) {
                        return;
                      }
                      onSelectLocation(location.id);
                    }}
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
