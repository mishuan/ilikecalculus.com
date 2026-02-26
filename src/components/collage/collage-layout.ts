"use client";

import { useLayoutEffect, useRef, useState } from "react";

type GapReadMode = "column" | "row-or-column";

type UseCollageMeasurementsOptions = {
  defaultGapPx?: number;
  gapReadMode?: GapReadMode;
  rowHeightFallback?: number;
  fallbackToContainerHeight?: boolean;
  rowHeightVariable?: string;
};

type CollageItemLike = {
  width: number;
  height: number;
};

export type CollageTile<TItem> = {
  item: TItem;
  width: number;
  index: number;
};

type CollageLayoutInput = {
  containerWidth: number;
  rowHeight: number;
  gapPx: number;
};

type BuildCollageStripInput = CollageLayoutInput & {
  minTileWidth?: number;
};

function parseGapPx(styles: CSSStyleDeclaration, gapReadMode: GapReadMode) {
  const rawGap =
    gapReadMode === "column"
      ? styles.columnGap || styles.gap || ""
      : styles.rowGap || styles.columnGap || styles.gap || "";
  return Number.parseFloat(rawGap);
}

function resolveRowHeight(
  container: HTMLElement,
  rowHeightVariable: string,
  rowHeightFallback: number,
  fallbackToContainerHeight: boolean,
) {
  const rowHeightProbe = document.createElement("div");
  rowHeightProbe.style.position = "absolute";
  rowHeightProbe.style.visibility = "hidden";
  rowHeightProbe.style.pointerEvents = "none";
  rowHeightProbe.style.blockSize = `var(${rowHeightVariable})`;
  rowHeightProbe.style.inlineSize = "0";
  rowHeightProbe.style.padding = "0";
  rowHeightProbe.style.border = "0";
  container.append(rowHeightProbe);
  const measuredRowHeight = rowHeightProbe.getBoundingClientRect().height;
  rowHeightProbe.remove();

  if (Number.isFinite(measuredRowHeight) && measuredRowHeight > 0) {
    return measuredRowHeight;
  }

  if (fallbackToContainerHeight) {
    return container.clientHeight;
  }

  return rowHeightFallback;
}

export function useCollageMeasurements<TElement extends HTMLElement>({
  defaultGapPx = 14,
  gapReadMode = "column",
  rowHeightFallback = 0,
  fallbackToContainerHeight = false,
  rowHeightVariable = "--row-height",
}: UseCollageMeasurementsOptions = {}) {
  const containerRef = useRef<TElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rowHeight, setRowHeight] = useState(rowHeightFallback);
  const [gapPx, setGapPx] = useState(defaultGapPx);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    function refresh() {
      const currentNode = containerRef.current;
      if (!currentNode) {
        return;
      }

      const styles = window.getComputedStyle(currentNode);
      const parsedGap = parseGapPx(styles, gapReadMode);
      const nextRowHeight = resolveRowHeight(
        currentNode,
        rowHeightVariable,
        rowHeightFallback,
        fallbackToContainerHeight,
      );

      setContainerWidth(currentNode.clientWidth);
      setRowHeight(nextRowHeight);
      setGapPx(Number.isFinite(parsedGap) ? parsedGap : defaultGapPx);
    }

    const observer = new ResizeObserver(refresh);
    observer.observe(node);
    refresh();
    window.addEventListener("resize", refresh);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, [defaultGapPx, fallbackToContainerHeight, gapReadMode, rowHeightFallback, rowHeightVariable]);

  return {
    containerRef,
    containerWidth,
    rowHeight,
    gapPx,
  };
}

export function buildCollageStrip<TItem extends CollageItemLike>(
  items: readonly TItem[],
  {
    containerWidth,
    rowHeight,
    gapPx,
    minTileWidth = 1,
  }: BuildCollageStripInput,
): CollageTile<TItem>[] {
  if (containerWidth <= 0 || rowHeight <= 0) {
    return [];
  }

  const tiles: CollageTile<TItem>[] = [];
  let usedWidth = 0;

  for (const [index, item] of items.entries()) {
    const ratio = item.width / item.height;
    const rawWidth = rowHeight * ratio;
    const fittedWidth = Math.max(minTileWidth, Math.min(rawWidth, containerWidth));
    const nextWidth = tiles.length === 0 ? fittedWidth : fittedWidth + gapPx;

    if (usedWidth + nextWidth > containerWidth) {
      break;
    }

    tiles.push({
      item,
      width: fittedWidth,
      index,
    });
    usedWidth += nextWidth;
  }

  return tiles;
}

export function buildCollageRows<TItem extends CollageItemLike>(
  items: readonly TItem[],
  {
    containerWidth,
    rowHeight,
    gapPx,
  }: CollageLayoutInput,
): Array<CollageTile<TItem>[]> {
  if (containerWidth <= 0 || rowHeight <= 0) {
    return [];
  }

  const rows: Array<CollageTile<TItem>[]> = [];
  let currentRow: CollageTile<TItem>[] = [];
  let usedWidth = 0;

  for (const [index, item] of items.entries()) {
    const ratio = item.width / item.height;
    const rawWidth = rowHeight * ratio;
    const fittedWidth = Math.max(1, Math.min(rawWidth, containerWidth));
    const nextWidth = currentRow.length === 0 ? fittedWidth : fittedWidth + gapPx;

    if (currentRow.length > 0 && usedWidth + nextWidth > containerWidth) {
      rows.push(currentRow);
      currentRow = [];
      usedWidth = 0;
    }

    currentRow.push({
      item,
      width: fittedWidth,
      index,
    });
    usedWidth += currentRow.length === 1 ? fittedWidth : fittedWidth + gapPx;
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}
