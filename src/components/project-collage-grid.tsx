"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildCollageRows,
  useCollageMeasurements,
} from "@/components/collage/collage-layout";
import { classNames } from "@/components/ui/class-names";
import { projectHref, type Project, type ProjectCategory } from "@/data/site-content";

type ProjectCollageGridProps = {
  project: Project;
  activeCategory: ProjectCategory;
  editMode?: boolean;
  deletingPhotoSrc?: string | null;
  isReorderingPhotos?: boolean;
  onDeletePhoto?: (src: string) => void;
  onReorderPhoto?: (draggingSrc: string, targetSrc: string) => void;
};

export function ProjectCollageGrid({
  project,
  activeCategory,
  editMode = false,
  deletingPhotoSrc = null,
  isReorderingPhotos = false,
  onDeletePhoto,
  onReorderPhoto,
}: ProjectCollageGridProps) {
  const { containerRef: gridRef, containerWidth, rowHeight, gapPx } =
    useCollageMeasurements<HTMLDivElement>({
      gapReadMode: "row-or-column",
      rowHeightFallback: 120,
    });
  const [draggingPhotoSrc, setDraggingPhotoSrc] = useState<string | null>(null);
  const slideshowHref = projectHref(project, activeCategory);

  const rows = useMemo(() => {
    const packedRows = buildCollageRows(project.images, {
      containerWidth,
      rowHeight,
      gapPx,
    });

    return packedRows.map((row) =>
      row.map((tile) => ({
        image: tile.item,
        width: tile.width,
        index: tile.index,
        key: `${project.slug}-${tile.item.src}-${tile.index}`,
      })),
    );
  }, [containerWidth, gapPx, project.images, project.slug, rowHeight]);

  return (
    <div className="project-collage-grid" ref={gridRef}>
      {rows.map((row, rowIndex) => (
        <div key={`${project.slug}-row-${rowIndex}`} className="project-collage-grid__row">
          {row.map((tile) => {
            const { image, index } = tile;
            const isEditable = editMode && !isReorderingPhotos;

            return (
              <div
                key={tile.key}
                className={classNames("collage-cell-wrapper", editMode && "collage-cell-wrapper--editable")}
                style={{ width: tile.width }}
                draggable={isEditable}
                onDragStart={() => {
                  if (!isEditable) {
                    return;
                  }
                  setDraggingPhotoSrc(image.src);
                }}
                onDragOver={(event) => {
                  if (!isEditable || !draggingPhotoSrc || draggingPhotoSrc === image.src) {
                    return;
                  }
                  event.preventDefault();
                }}
                onDrop={() => {
                  if (!isEditable || !draggingPhotoSrc || draggingPhotoSrc === image.src) {
                    return;
                  }
                  onReorderPhoto?.(draggingPhotoSrc, image.src);
                  setDraggingPhotoSrc(null);
                }}
                onDragEnd={() => setDraggingPhotoSrc(null)}
              >
                <Link
                  href={`${slideshowHref}?photo=${index + 1}`}
                  className="collage-cell"
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

                {editMode ? (
                  <button
                    type="button"
                    className="collage-cell__delete"
                    aria-label={`Delete photo ${index + 1}`}
                    disabled={deletingPhotoSrc === image.src || isReorderingPhotos}
                    onClick={() => onDeletePhoto?.(image.src)}
                  >
                    {deletingPhotoSrc === image.src ? "…" : "x"}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
