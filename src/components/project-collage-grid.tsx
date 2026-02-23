"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { projectHref, type Project, type ProjectCategory } from "@/data/site-content";

type ProjectCollageGridProps = {
  project: Project;
  activeCategory: ProjectCategory;
};

type RowItem = {
  image: Project["images"][number];
  width: number;
  index: number;
};

const DEFAULT_CELL_GAP_PX = 14;

export function ProjectCollageGrid({ project, activeCategory }: ProjectCollageGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const [gapPx, setGapPx] = useState(DEFAULT_CELL_GAP_PX);
  const slideshowHref = projectHref(project, activeCategory);

  useLayoutEffect(() => {
    const node = gridRef.current;
    if (!node) {
      return;
    }

    function refresh() {
      const currentNode = gridRef.current;
      if (!currentNode) {
        return;
      }

      const width = currentNode.clientWidth;
      const styles = window.getComputedStyle(currentNode);
      const resolvedRowHeight = Number.parseFloat(styles.getPropertyValue("--row-height"));
      const resolvedGap = Number.parseFloat(styles.rowGap || styles.columnGap || styles.gap || "");

      setContainerWidth(width);
      setRowHeight(Number.isFinite(resolvedRowHeight) ? resolvedRowHeight : 120);
      setGapPx(Number.isFinite(resolvedGap) ? resolvedGap : DEFAULT_CELL_GAP_PX);
    }

    const observer = new ResizeObserver(refresh);
    observer.observe(node);
    refresh();
    window.addEventListener("resize", refresh);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, []);

  const rows = useMemo(() => {
    if (containerWidth <= 0 || rowHeight <= 0) {
      return [] as RowItem[][];
    }

    const nextRows: RowItem[][] = [];
    let currentRow: RowItem[] = [];
    let usedWidth = 0;

    project.images.forEach((image, index) => {
      const ratio = image.width / image.height;
      const rawWidth = rowHeight * ratio;
      const fittedWidth = Math.max(58, Math.min(rawWidth, containerWidth));
      const nextWidth = currentRow.length === 0 ? fittedWidth : fittedWidth + gapPx;

      if (currentRow.length > 0 && usedWidth + nextWidth > containerWidth) {
        nextRows.push(currentRow);
        currentRow = [];
        usedWidth = 0;
      }

      currentRow.push({ image, width: fittedWidth, index });
      usedWidth += currentRow.length === 1 ? fittedWidth : fittedWidth + gapPx;
    });

    if (currentRow.length > 0) {
      nextRows.push(currentRow);
    }

    return nextRows;
  }, [containerWidth, gapPx, project.images, rowHeight]);

  return (
    <div className="project-collage-grid" ref={gridRef}>
      {rows.map((row, rowIndex) => (
        <div key={`${project.slug}-row-${rowIndex}`} className="project-collage-grid__row">
          {row.map(({ image, width, index }) => {
            return (
              <Link
                key={`${project.slug}-${image.src}-${index}`}
                href={`${slideshowHref}?photo=${index + 1}`}
                className="collage-cell"
                style={{ width }}
                aria-label={`Open ${project.title} photo ${index + 1}`}
                data-testid={`project-thumbnail-${index + 1}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt || `${project.title} preview ${index + 1}`}
                  width={image.width}
                  height={image.height}
                  className="collage-cell__image"
                  sizes="(max-width: 960px) 42vw, 20vw"
                  priority={rowIndex === 0 && index < 3}
                />
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
