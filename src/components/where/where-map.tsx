"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import { feature } from "topojson-client";
import land110m from "world-atlas/land-110m.json";
import { createHoverIntent } from "@/components/where/where-hover-intent";
import type { ResolvedWhereLocation } from "@/components/where/use-where-state";
import { classNames } from "@/components/ui/class-names";

type WhereMapProps = {
  locations: ResolvedWhereLocation[];
  selectedLocationId: string | null;
  hoveredLocationId: string | null;
  focusedLocationId: string | null;
  latestPastLocationId: string | null;
  onSelectLocation: (id: string) => void;
  onHoverLocation: (id: string | null) => void;
};

const MAP_WIDTH = 980;
const MAP_HEIGHT = 520;
const GRATICULE_LATITUDES = [-60, -30, 0, 30, 60] as const;
const GRATICULE_LONGITUDES = [-120, -60, 0, 60, 120] as const;
type CoordinatePair = readonly [latitude: number, longitude: number];
type LandGeometry = Polygon | MultiPolygon;
const LAND_AREA_MIN = 90;
const SMALL_POLAR_BLOB_AREA_MAX = 220;
const POLAR_LATITUDE_MIN = 70;
const TAIWAN_BLOB_AREA_MIN = 18;
const TAIWAN_BOUNDS = {
  latitudeMin: 20.5,
  latitudeMax: 26.8,
  longitudeMin: 118.5,
  longitudeMax: 123.8,
} as const;

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
const FOCUS_SCALE = 1.14;
const WHEEL_ZOOM_SPEED = 0.0034;
const INTERACTION_IDLE_MS = 120;
const WORLD_X_OFFSETS = [-MAP_WIDTH, 0, MAP_WIDTH] as const;
const MARKER_RADIUS = {
  base: 3.2,
  hovered: 3.9,
  selected: 4.6,
  latest: 4.8,
} as const;
const MARKER_RING_RADIUS = {
  hovered: 6.6,
  upcomingDestination: 8.2,
  selected: 8,
} as const;
const MARKER_HIT_RADIUS = 9.5;
const SEGMENT_STYLE = {
  opacity: {
    base: 0.22,
    intensityScale: 0.45,
    selectedBoost: 0.08,
    focusedBoost: 0.07,
  },
  strokeWidth: {
    base: 0.65,
    intensityScale: 1.35,
    selectedBoost: 0.35,
    focusedBoost: 0.25,
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeTranslateX(translateX: number, scale: number) {
  const period = MAP_WIDTH * scale;
  if (period <= 0) {
    return translateX;
  }

  const wrapped = ((translateX % period) + period) % period;
  return wrapped - period;
}

function clampView(view: MapView): MapView {
  const nextScale = clamp(view.scale, MIN_CAMERA_SCALE, MAX_CAMERA_SCALE);
  const minY = MAP_HEIGHT - MAP_HEIGHT * nextScale;

  return {
    scale: nextScale,
    translateX: normalizeTranslateX(view.translateX, nextScale),
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

function stripClosingPoint(ring: ReadonlyArray<Position>) {
  if (ring.length <= 1) {
    return [...ring];
  }

  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring.slice(0, -1);
  }

  return [...ring];
}

function unwrapRingLongitudes(ring: ReadonlyArray<Position>) {
  const openRing = stripClosingPoint(ring);
  if (openRing.length === 0) {
    return [] as Position[];
  }

  let longitudeOffset = 0;
  let previousLongitude = Number(openRing[0][0]);
  const unwrapped: Position[] = [[previousLongitude, Number(openRing[0][1])]];

  for (let index = 1; index < openRing.length; index += 1) {
    const [rawLongitude, rawLatitude] = openRing[index];
    let longitude = Number(rawLongitude) + longitudeOffset;
    const latitude = Number(rawLatitude);
    const difference = longitude - previousLongitude;

    if (difference > 180) {
      longitudeOffset -= 360;
      longitude = Number(rawLongitude) + longitudeOffset;
    } else if (difference < -180) {
      longitudeOffset += 360;
      longitude = Number(rawLongitude) + longitudeOffset;
    }

    unwrapped.push([longitude, latitude]);
    previousLongitude = longitude;
  }

  return unwrapped;
}

function recenterRingLongitudes(ring: ReadonlyArray<Position>) {
  if (ring.length === 0) {
    return [] as Position[];
  }

  const meanLongitude =
    ring.reduce((sum, [longitude]) => sum + Number(longitude), 0) / ring.length;
  const turns = Math.round(meanLongitude / 360);
  if (turns === 0) {
    return [...ring];
  }

  const shift = turns * 360;
  return ring.map(([longitude, latitude]) => [Number(longitude) - shift, Number(latitude)]);
}

function averageLatitude(ring: ReadonlyArray<Position>) {
  if (ring.length === 0) {
    return 0;
  }

  let latitudeSum = 0;
  for (const position of ring) {
    latitudeSum += Number(position[1]);
  }

  return latitudeSum / ring.length;
}

function averageLongitude(ring: ReadonlyArray<Position>) {
  if (ring.length === 0) {
    return 0;
  }

  let longitudeSum = 0;
  for (const position of ring) {
    longitudeSum += Number(position[0]);
  }

  return longitudeSum / ring.length;
}

function isWithinBounds(
  latitude: number,
  longitude: number,
  bounds: {
    latitudeMin: number;
    latitudeMax: number;
    longitudeMin: number;
    longitudeMax: number;
  },
) {
  return (
    latitude >= bounds.latitudeMin &&
    latitude <= bounds.latitudeMax &&
    longitude >= bounds.longitudeMin &&
    longitude <= bounds.longitudeMax
  );
}

function ringProjectedArea(ring: ReadonlyArray<Position>) {
  if (ring.length < 3) {
    return 0;
  }

  let areaTwice = 0;

  for (let index = 0; index < ring.length; index += 1) {
    const [longitudeA, latitudeA] = ring[index];
    const [longitudeB, latitudeB] = ring[(index + 1) % ring.length];
    const pointA = project(Number(latitudeA), Number(longitudeA));
    const pointB = project(Number(latitudeB), Number(longitudeB));
    areaTwice += pointA.x * pointB.y - pointB.x * pointA.y;
  }

  return Math.abs(areaTwice * 0.5);
}

function targetBlobVertexCount(area: number) {
  if (area > 45_000) {
    return 28;
  }

  if (area > 18_000) {
    return 24;
  }

  if (area > 6_000) {
    return 21;
  }

  if (area > 2_000) {
    return 17;
  }

  if (area > 700) {
    return 14;
  }

  return 11;
}

function sampleRingUniform(ring: ReadonlyArray<Position>, targetPointCount: number) {
  const safeTargetCount = Math.max(3, targetPointCount);
  if (ring.length <= safeTargetCount) {
    return [...ring];
  }

  const step = ring.length / safeTargetCount;
  const sampled: Position[] = [];
  let previousIndex = -1;

  for (let index = 0; index < safeTargetCount; index += 1) {
    let ringIndex = Math.floor(index * step);
    if (ringIndex <= previousIndex) {
      ringIndex = previousIndex + 1;
    }
    if (ringIndex >= ring.length) {
      ringIndex = ring.length - 1;
    }

    sampled.push(ring[ringIndex]);
    previousIndex = ringIndex;
  }

  return sampled;
}

function smoothClosedRing(ring: ReadonlyArray<Position>, iterations: number) {
  let current = [...ring];

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    if (current.length < 3) {
      break;
    }

    const next: Position[] = [];

    for (let index = 0; index < current.length; index += 1) {
      const [aLongitude, aLatitude] = current[index];
      const [bLongitude, bLatitude] = current[(index + 1) % current.length];

      next.push([
        Number(aLongitude) * 0.75 + Number(bLongitude) * 0.25,
        Number(aLatitude) * 0.75 + Number(bLatitude) * 0.25,
      ]);
      next.push([
        Number(aLongitude) * 0.25 + Number(bLongitude) * 0.75,
        Number(aLatitude) * 0.25 + Number(bLatitude) * 0.75,
      ]);
    }

    current = next;
  }

  return current;
}

function toBlobCoordinates(ring: ReadonlyArray<Position>) {
  return ring.map(([longitude, latitude]) => [Number(latitude), Number(longitude)] as const);
}

function createLandBlobs() {
  const topology = land110m as unknown as Parameters<typeof feature>[0] & {
    objects: { land: Parameters<typeof feature>[1] };
  };
  const landCollection = feature(topology, topology.objects.land) as FeatureCollection<LandGeometry>;

  const blobEntries: Array<{ area: number; points: CoordinatePair[] }> = [];

  for (const landFeature of landCollection.features) {
    const geometry = landFeature.geometry;
    if (!geometry) {
      continue;
    }

    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

    for (const polygon of polygons) {
      const outerRing = polygon[0];
      if (!outerRing || outerRing.length < 4) {
        continue;
      }

      const unwrappedRing = unwrapRingLongitudes(outerRing);
      const normalizedRing = recenterRingLongitudes(unwrappedRing);
      const area = ringProjectedArea(normalizedRing);
      const centroidLatitude = averageLatitude(normalizedRing);
      const centroidLongitude = averageLongitude(normalizedRing);
      const isTaiwanBlob = isWithinBounds(centroidLatitude, centroidLongitude, TAIWAN_BOUNDS);
      const passesBaseArea = area >= LAND_AREA_MIN;
      const passesTaiwanArea = isTaiwanBlob && area >= TAIWAN_BLOB_AREA_MIN;
      if (!passesBaseArea && !passesTaiwanArea) {
        continue;
      }

      if (
        Math.abs(centroidLatitude) >= POLAR_LATITUDE_MIN &&
        area < SMALL_POLAR_BLOB_AREA_MAX
      ) {
        continue;
      }

      const sampledRing = sampleRingUniform(normalizedRing, targetBlobVertexCount(area));
      const smoothedRing = area > 120 ? smoothClosedRing(sampledRing, 1) : sampledRing;
      blobEntries.push({
        area,
        points: toBlobCoordinates(smoothedRing),
      });
    }
  }

  return blobEntries.sort((a, b) => b.area - a.area).map((entry) => entry.points);
}

const LAND_BLOBS = createLandBlobs();

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

function resolveMarkerRadius({
  isLatestPast,
  isSelected,
  isHovered,
}: {
  isLatestPast: boolean;
  isSelected: boolean;
  isHovered: boolean;
}) {
  if (isLatestPast) {
    return MARKER_RADIUS.latest;
  }

  if (isSelected) {
    return MARKER_RADIUS.selected;
  }

  if (isHovered) {
    return MARKER_RADIUS.hovered;
  }

  return MARKER_RADIUS.base;
}

function resolveFocusedView(selectedPoint: { x: number; y: number } | null): MapView {
  if (!selectedPoint) {
    return { scale: 1, translateX: 0, translateY: 0 };
  }

  const targetX = MAP_WIDTH * 0.5 - selectedPoint.x * FOCUS_SCALE;
  const targetY = MAP_HEIGHT * 0.5 - selectedPoint.y * FOCUS_SCALE;
  return clampView({
    scale: FOCUS_SCALE,
    translateX: targetX,
    translateY: targetY,
  });
}

function resolveSegmentOpacity({
  intensity,
  selected,
  focused,
}: {
  intensity: number;
  selected: boolean;
  focused: boolean;
}) {
  return (
    SEGMENT_STYLE.opacity.base +
    intensity * SEGMENT_STYLE.opacity.intensityScale +
    (selected ? SEGMENT_STYLE.opacity.selectedBoost : 0) +
    (focused && !selected ? SEGMENT_STYLE.opacity.focusedBoost : 0)
  );
}

function resolveSegmentStrokeWidth({
  intensity,
  selected,
  focused,
}: {
  intensity: number;
  selected: boolean;
  focused: boolean;
}) {
  return (
    SEGMENT_STYLE.strokeWidth.base +
    intensity * SEGMENT_STYLE.strokeWidth.intensityScale +
    (selected ? SEGMENT_STYLE.strokeWidth.selectedBoost : 0) +
    (focused && !selected ? SEGMENT_STYLE.strokeWidth.focusedBoost : 0)
  );
}

export function WhereMap({
  locations,
  selectedLocationId,
  hoveredLocationId,
  focusedLocationId,
  latestPastLocationId,
  onSelectLocation,
  onHoverLocation,
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointersRef = useRef<Map<number, PointerSample>>(new Map());
  const panPointerIdRef = useRef<number | null>(null);
  const panLastRef = useRef<PointerSample | null>(null);
  const pinchRef = useRef<PinchGesture | null>(null);
  const interactionTimeoutRef = useRef<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const selectedPoint = selectedLocationId ? pointsById.get(selectedLocationId) : null;
  const [view, setView] = useState<MapView>(() => resolveFocusedView(selectedPoint ?? null));
  const viewRef = useRef<MapView>(view);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(
    () => () => {
      if (interactionTimeoutRef.current !== null) {
        window.clearTimeout(interactionTimeoutRef.current);
      }
    },
    [],
  );

  const mapTransform = useMemo(
    () => `translate(${view.translateX} ${view.translateY}) scale(${view.scale})`,
    [view.scale, view.translateX, view.translateY],
  );
  const inverseViewScale = 1 / view.scale;

  function toMapCoordinates(clientX: number, clientY: number) {
    const svgNode = svgRef.current;
    if (!svgNode) {
      return null;
    }

    const ctm = svgNode.getScreenCTM();
    if (!ctm) {
      return null;
    }

    const inverseMatrix = ctm.inverse();
    const basePoint = svgNode.createSVGPoint();
    basePoint.x = clientX;
    basePoint.y = clientY;
    const mappedBase = basePoint.matrixTransform(inverseMatrix);

    const rightPoint = svgNode.createSVGPoint();
    rightPoint.x = clientX + 1;
    rightPoint.y = clientY;
    const mappedRight = rightPoint.matrixTransform(inverseMatrix);

    const downPoint = svgNode.createSVGPoint();
    downPoint.x = clientX;
    downPoint.y = clientY + 1;
    const mappedDown = downPoint.matrixTransform(inverseMatrix);

    return {
      x: mappedBase.x,
      y: mappedBase.y,
      unitsPerPixelX: Math.max(0.0001, Math.abs(mappedRight.x - mappedBase.x)),
      unitsPerPixelY: Math.max(0.0001, Math.abs(mappedDown.y - mappedBase.y)),
    };
  }

  function markInteracting() {
    setIsInteracting(true);
    if (interactionTimeoutRef.current !== null) {
      window.clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
      interactionTimeoutRef.current = null;
    }, INTERACTION_IDLE_MS);
  }

  useEffect(() => {
    const mapNode = mapRef.current;
    if (!mapNode) {
      return;
    }

    function onWheel(event: WheelEvent) {
      const mappedPointer = toMapCoordinates(event.clientX, event.clientY);
      if (!mappedPointer) {
        return;
      }

      const { x: mapX, y: mapY, unitsPerPixelX, unitsPerPixelY } = mappedPointer;
      const currentView = viewRef.current;
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.65;
      const shouldPan =
        !event.ctrlKey &&
        !event.metaKey &&
        (horizontalIntent || currentView.scale > MIN_CAMERA_SCALE + 0.01);

      event.preventDefault();

      if (shouldPan) {
        const nextView = clampView({
          scale: currentView.scale,
          translateX: currentView.translateX - event.deltaX * unitsPerPixelX,
          translateY:
            currentView.scale > MIN_CAMERA_SCALE + 0.01
              ? currentView.translateY - event.deltaY * unitsPerPixelY
              : currentView.translateY,
        });

        markInteracting();
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

      markInteracting();
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

      markInteracting();
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
      setIsPanning(true);
    }

    panLastRef.current = { x: event.clientX, y: event.clientY };

    markInteracting();
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
      const focused = focusedLocationId === from.id || focusedLocationId === to.id;
      const segmentKey = `${from.id}-${to.id}`;

      return {
        key: segmentKey,
        from: fromPoint,
        to: toPoint,
        intensity,
        selected,
        focused,
        upcoming: from.isFuture || to.isFuture,
        pieces: routeSegmentPieces(from, to),
        isLatestArrival: latestArrivalKey === segmentKey,
        isNextUpcoming: nextUpcomingKey === segmentKey,
      };
    }).filter((segment): segment is NonNullable<typeof segment> => Boolean(segment));
  }, [focusedLocationId, latestArrivalKey, locations, nextUpcomingKey, pointsById, selectedLocationId]);

  return (
    <section className="where-map-panel">
      <header className="where-map-panel__header">
        <h2 className="where-map-panel__title">map</h2>
      </header>

      <div
        ref={mapRef}
        className={classNames(
          "where-map",
          "where-map--interactive",
          isPanning && "where-map--panning",
          isInteracting && "where-map--interacting",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
        onPointerLeave={() => {
          onHoverLocation(null);
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Map of visited and upcoming locations"
        >
          <defs>
            <linearGradient id="where-map-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--surface-where-map-bg-start)" />
              <stop offset="100%" stopColor="var(--surface-where-map-bg-end)" />
            </linearGradient>
          </defs>

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#where-map-bg)" />

          <g className="where-map__graticule" aria-hidden="true">
            {GRATICULE_LATITUDES.map((latitude) => {
              const y = project(latitude, 0).y;
              return <line key={`lat-${latitude}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y} />;
            })}
            {GRATICULE_LONGITUDES.map((longitude) => {
              const x = project(0, longitude).x;
              return <line key={`lng-${longitude}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT} />;
            })}
          </g>

          <g className="where-map__content" transform={mapTransform}>
            {WORLD_X_OFFSETS.map((offset) => (
              <g key={`where-world-${offset}`} transform={`translate(${offset} 0)`}>
                <g className="where-map__land" aria-hidden="true">
                  {LAND_BLOBS.map((blob, index) => (
                    <path key={`land-${index}`} d={polygonPath(blob)} />
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
                      className={classNames(
                        "where-map__segment",
                        segment.upcoming && "where-map__segment--upcoming",
                        segment.selected && "where-map__segment--selected",
                        segment.focused && "where-map__segment--focused",
                        segment.isLatestArrival && "where-map__segment--latest-arrival",
                        segment.isNextUpcoming && "where-map__segment--next-upcoming",
                      )}
                      style={{
                        opacity: String(
                          resolveSegmentOpacity({
                            intensity: segment.intensity,
                            selected: segment.selected,
                            focused: segment.focused,
                          }),
                        ),
                        strokeWidth: `${resolveSegmentStrokeWidth({
                          intensity: segment.intensity,
                          selected: segment.selected,
                          focused: segment.focused,
                        })}px`,
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
                  const isHovered = hoveredLocationId === location.id;
                  const markerRadius =
                    resolveMarkerRadius({ isLatestPast, isSelected, isHovered }) * inverseViewScale;
                  const selectedRingRadius = MARKER_RING_RADIUS.selected * inverseViewScale;
                  const hoveredRingRadius = MARKER_RING_RADIUS.hovered * inverseViewScale;
                  const upcomingRingRadius = MARKER_RING_RADIUS.upcomingDestination * inverseViewScale;
                  const markerHitRadius = MARKER_HIT_RADIUS * inverseViewScale;
                  const hoverIntent = createHoverIntent({
                    locationId: location.id,
                    hoveredLocationId,
                    onHoverLocation,
                  });

                  return (
                    <g key={location.id}>
                      {isHovered && !isSelected ? (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={hoveredRingRadius}
                          className="where-map__marker-ring where-map__marker-ring--hovered"
                          aria-hidden="true"
                        />
                      ) : null}
                      {isUpcomingDestination ? (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={upcomingRingRadius}
                          className="where-map__marker-ring where-map__marker-ring--upcoming-destination"
                          aria-hidden="true"
                        />
                      ) : null}
                      {isSelected ? (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={selectedRingRadius}
                          className="where-map__marker-ring where-map__marker-ring--selected"
                          aria-hidden="true"
                        />
                      ) : null}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={markerRadius}
                        className={classNames(
                          "where-map__marker",
                          isSelected && "where-map__marker--selected",
                          isHovered && "where-map__marker--hovered",
                          isLatestPast && "where-map__marker--latest",
                          location.isFuture && "where-map__marker--future",
                        )}
                        data-testid={`where-map-node-${location.id}`}
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={markerHitRadius}
                        className="where-map__marker-hit"
                        aria-hidden="true"
                        data-testid={`where-map-node-hit-${location.id}`}
                        onPointerEnter={hoverIntent.activate}
                        onPointerLeave={hoverIntent.clear}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectLocation(location.id);
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
        </svg>

        {locations.length === 0 ? (
          <p className="where-map__empty">Add locations to start drawing your route.</p>
        ) : null}
      </div>
    </section>
  );
}
