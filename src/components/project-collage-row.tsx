"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { projectHref, type Project, type ProjectCategory } from "@/data/site-content";

type ProjectCollageRowProps = {
  project: Project;
  preferredCategory?: ProjectCategory;
};

const CELL_GAP_PX = 14;
const MIN_ROW_HEIGHT = 90;
const MAX_ROW_HEIGHT = 132;

function getRowHeight(viewportWidth: number) {
  return Math.max(MIN_ROW_HEIGHT, Math.min(MAX_ROW_HEIGHT, viewportWidth * 0.12));
}

export function ProjectCollageRow({ project, preferredCategory }: ProjectCollageRowProps) {
  const href = projectHref(project, preferredCategory);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const previewImages = project.images;

  useEffect(() => {
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
      setContainerWidth(width);
      setViewportWidth(window.innerWidth);
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
    const rowHeight = getRowHeight(viewportWidth);
    const availableWidth = containerWidth > 0 ? containerWidth : 1280;
    const images: Array<{ image: (typeof previewImages)[number]; width: number }> = [];
    let usedWidth = 0;

    for (const image of previewImages) {
      const ratio = image.width / image.height;
      const rawWidth = rowHeight * ratio;
      const fittedWidth = Math.max(58, Math.min(rawWidth, availableWidth));
      const nextWidth = images.length === 0 ? fittedWidth : fittedWidth + CELL_GAP_PX;

      if (usedWidth + nextWidth > availableWidth) {
        break;
      }

      images.push({ image, width: Math.round(fittedWidth) });
      usedWidth += nextWidth;
    }

    return images;
  }, [containerWidth, previewImages, viewportWidth]);

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
