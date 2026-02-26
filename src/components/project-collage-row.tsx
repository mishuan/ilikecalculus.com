"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  buildCollageStrip,
  useCollageMeasurements,
} from "@/components/collage/collage-layout";
import { classNames } from "@/components/ui/class-names";
import {
  projectHref,
  projectThumbnailsHref,
  type Project,
  type ProjectCategory,
} from "@/data/site-content";

type ProjectCollageRowProps = {
  project: Project;
  preferredCategory?: ProjectCategory;
  editMode?: boolean;
  reorderEnabled?: boolean;
  onProjectDragStart?: (slug: string) => void;
  onProjectDrop?: (targetSlug: string) => void;
  onProjectDragEnd?: () => void;
};

export function ProjectCollageRow({
  project,
  preferredCategory,
  editMode = false,
  reorderEnabled = false,
  onProjectDragStart,
  onProjectDrop,
  onProjectDragEnd,
}: ProjectCollageRowProps) {
  const slideshowHref = projectHref(project, preferredCategory);
  const thumbnailsHref = projectThumbnailsHref(project, preferredCategory);
  const { containerRef: trackRef, containerWidth, rowHeight, gapPx } =
    useCollageMeasurements<HTMLDivElement>({
      gapReadMode: "column",
      fallbackToContainerHeight: true,
    });

  const fittedImages = useMemo(() => {
    return buildCollageStrip(project.images, {
      containerWidth,
      rowHeight,
      gapPx,
      minTileWidth: 58,
    });
  }, [containerWidth, gapPx, project.images, rowHeight]);

  return (
    <article
      className={classNames("collage-row", editMode && "collage-row--editable")}
      draggable={reorderEnabled}
      onDragStart={() => {
        if (!reorderEnabled) {
          return;
        }
        onProjectDragStart?.(project.slug);
      }}
      onDragOver={(event) => {
        if (!reorderEnabled) {
          return;
        }
        event.preventDefault();
      }}
      onDrop={() => {
        if (!reorderEnabled) {
          return;
        }
        onProjectDrop?.(project.slug);
      }}
      onDragEnd={() => onProjectDragEnd?.()}
    >
      <h3 className="collage-row__title">
        {editMode && reorderEnabled ? <span className="collage-row__drag-handle">::</span> : null}
        <Link href={thumbnailsHref}>{project.title}</Link>
      </h3>

      <div className="collage-track" ref={trackRef}>
        {fittedImages.length === 0 ? (
          <Link
            href={thumbnailsHref}
            className={classNames("collage-cell", "collage-cell--empty", editMode && "collage-cell--empty-edit")}
            aria-label={`Open ${project.title} thumbnails`}
          >
            <span className="collage-cell__empty-plus">+</span>
            <span className="collage-cell__empty-copy">add photos</span>
          </Link>
        ) : (
          fittedImages.map(({ item: image, width, index }) => (
            <Link
              key={`${project.slug}-${image.src}-${index}`}
              href={`${slideshowHref}?photo=${index + 1}`}
              className="collage-cell"
              style={{ width }}
              aria-label={`Open ${project.title}`}
            >
              <Image
                src={image.src}
                alt={image.alt || `${project.title} preview ${index + 1}`}
                width={image.width}
                height={image.height}
                className="collage-cell__image"
                sizes="(max-width: 960px) 40vw, 20vw"
                priority={index < 3}
              />
            </Link>
          ))
        )}
      </div>
    </article>
  );
}
