"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  projectThumbnailsHref,
  type Project,
  type ProjectCategory,
} from "@/data/site-content";
import { TextActionButton, TextActionLabel, TextActionLink } from "@/components/ui/text-action";

type NeighborProject = {
  href: string;
  title: string;
} | null;

type ProjectSlideshowProps = {
  project: Project;
  activeCategory: ProjectCategory;
  initialIndex?: number;
  nextProject: NeighborProject;
  previousProject: NeighborProject;
};

function clampIndex(index: number, total: number) {
  return Math.min(Math.max(index, 0), Math.max(total - 1, 0));
}

export function ProjectSlideshow({
  project,
  activeCategory,
  initialIndex = 0,
  nextProject,
  previousProject,
}: ProjectSlideshowProps) {
  const router = useRouter();
  const total = project.images.length;
  const hasImages = total > 0;
  const resolvedInitialIndex = clampIndex(initialIndex, total);
  const [index, setIndex] = useState(resolvedInitialIndex);
  const indexRef = useRef(resolvedInitialIndex);
  const navigatingRef = useRef(false);
  const closeSlideshow = useCallback(() => router.back(), [router]);
  const thumbnailsHref = `${projectThumbnailsHref(project, activeCategory)}?photo=${index + 1}`;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const pushOnce = useCallback(
    (href: string) => {
      if (navigatingRef.current) {
        return;
      }
      navigatingRef.current = true;
      router.push(href);
    },
    [router],
  );

  const goToPrevious = useCallback(() => {
    const currentIndex = indexRef.current;

    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      indexRef.current = nextIndex;
      setIndex(nextIndex);
      return;
    }

    if (previousProject) {
      pushOnce(previousProject.href);
    }
  }, [previousProject, pushOnce]);

  const goToNext = useCallback(() => {
    const currentIndex = indexRef.current;

    if (currentIndex < total - 1) {
      const nextIndex = currentIndex + 1;
      indexRef.current = nextIndex;
      setIndex(nextIndex);
      return;
    }

    if (nextProject) {
      pushOnce(nextProject.href);
    }
  }, [nextProject, pushOnce, total]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goToNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeSlideshow();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeSlideshow, goToNext, goToPrevious]);

  if (!hasImages) {
    return (
      <section className="page page--viewer">
        <article className="viewer-stage">
          <header className="viewer-topbar">
            <div className="viewer-topbar__project" />
            <div className="viewer-topbar__actions">
              <TextActionButton
                className="viewer-text-link viewer-close"
                underline="none"
                onClick={closeSlideshow}
                aria-label="Close slideshow"
              >
                x
              </TextActionButton>
            </div>
          </header>
          <footer className="viewer-bottom">
            <div className="viewer-bottom__meta">
              <h1 className="viewer-bottom__title">{project.title}</h1>
              <p className="viewer-bottom__description">No photos yet for this project.</p>
            </div>
            <div className="viewer-bottom__left">
              <div className="viewer-bottom__view-toggle" aria-label="Project view">
                <TextActionLabel className="viewer-bottom__mode-label">slideshow</TextActionLabel>
                <span className="viewer-bottom__view-separator" aria-hidden="true">
                  /
                </span>
                <TextActionLink
                  href={thumbnailsHref}
                  underline="hover"
                  className="viewer-bottom__thumbnail-link"
                  data-testid="slideshow-thumbnail-view-link"
                >
                  thumbnails
                </TextActionLink>
              </div>
            </div>
          </footer>
        </article>
      </section>
    );
  }

  const activeImage = project.images[index];
  const projectDescription = project.description
    ? project.description
    : `${project.images.length} photographs in this collection.`;

  return (
    <section className="page page--viewer">
      <article className="viewer-stage">
        <header className="viewer-topbar">
          <div className="viewer-topbar__meta">
            <h1 className="collage-row__title viewer-topbar__title">{project.title}</h1>
            <p className="viewer-bottom__description viewer-topbar__description">{projectDescription}</p>
          </div>

          <div className="viewer-topbar__actions">
            <TextActionButton
              className="viewer-text-link viewer-close"
              underline="none"
              onClick={closeSlideshow}
              aria-label="Close slideshow"
            >
              x
            </TextActionButton>
          </div>
        </header>

        <div className="slideshow__viewport">
          <button
            type="button"
            className="slideshow__tap slideshow__tap--left"
            onClick={goToPrevious}
            aria-label="Previous photo"
          />
          <figure className="slideshow__figure">
            <Image
              key={activeImage.src}
              src={activeImage.src}
              alt={activeImage.alt || `${project.title} photograph ${index + 1}`}
              fill
              priority
              className="slideshow__image"
              sizes="(max-width: 960px) 100vw, 66vw"
            />
          </figure>
          <button
            type="button"
            className="slideshow__tap slideshow__tap--right"
            onClick={goToNext}
            aria-label="Next photo"
          />
        </div>

        <footer className="viewer-bottom">
          <div className="viewer-bottom__left">
            <div className="viewer-bottom__view-toggle project-thumbnails__view-toggle" aria-label="Project view">
              <TextActionLabel underline="underline">slideshow</TextActionLabel>
              <span className="viewer-bottom__view-separator project-thumbnails__view-separator" aria-hidden="true">
                /
              </span>
              <TextActionLink
                href={thumbnailsHref}
                underline="hover"
                data-testid="slideshow-thumbnail-view-link"
              >
                thumbnails
              </TextActionLink>
            </div>
          </div>
          <div className="viewer-bottom__project">
            {nextProject ? (
              <TextActionLink href={nextProject.href} underline="hover">
                next project -&gt; {nextProject.title}
              </TextActionLink>
            ) : null}
            <p className="slideshow__counter">
              {index + 1} / {total}
            </p>
          </div>
        </footer>
      </article>
    </section>
  );
}
