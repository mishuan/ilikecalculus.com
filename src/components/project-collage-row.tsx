"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { projectHref, type Project, type ProjectCategory } from "@/data/site-content";

type ProjectCollageRowProps = {
  project: Project;
  preferredCategory?: ProjectCategory;
};

const DEFAULT_CELL_GAP_PX = 14;

export function ProjectCollageRow({ project, preferredCategory }: ProjectCollageRowProps) {
  const href = projectHref(project, preferredCategory);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const [gapPx, setGapPx] = useState(DEFAULT_CELL_GAP_PX);
  const previewImages = project.images;

  useLayoutEffect(() => {
    const node = trackRef.current;
    if (!node) {
      return;
    }

    function refresh() {
      const currentNode = trackRef.current;
      if (!currentNode) {
        return;
      }

      const width = currentNode.clientWidth;
      const styles = window.getComputedStyle(currentNode);
      const resolvedRowHeight = Number.parseFloat(styles.getPropertyValue("--row-height"));
      const resolvedGap = Number.parseFloat(styles.columnGap || styles.gap || "");

      setContainerWidth(width);
      setRowHeight(Number.isFinite(resolvedRowHeight) ? resolvedRowHeight : currentNode.clientHeight);
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

  const fittedImages = useMemo(() => {
    if (containerWidth <= 0 || rowHeight <= 0) {
      return [];
    }

    const availableWidth = containerWidth;
    const images: Array<{ image: (typeof previewImages)[number]; width: number }> = [];
    let usedWidth = 0;

    for (const image of previewImages) {
      const ratio = image.width / image.height;
      const rawWidth = rowHeight * ratio;
      const fittedWidth = Math.max(58, Math.min(rawWidth, availableWidth));
      const nextWidth = images.length === 0 ? fittedWidth : fittedWidth + gapPx;

      if (usedWidth + nextWidth > availableWidth) {
        break;
      }

      images.push({ image, width: fittedWidth });
      usedWidth += nextWidth;
    }

    return images;
  }, [containerWidth, gapPx, previewImages, rowHeight]);

  return (
    <article className="collage-row">
      <h3 className="collage-row__title">
        <Link href={href}>{project.title}</Link>
      </h3>

      <div className="collage-track" ref={trackRef}>
        {fittedImages.map(({ image, width }, index) => (
          <Link
            key={`${project.slug}-${image.src}-${index}`}
            href={`${href}?photo=${index + 1}`}
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
        ))}
      </div>
    </article>
  );
}
