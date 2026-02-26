"use client";

import { classNames } from "@/components/ui/class-names";
import { TextActionLabel, TextActionLink } from "@/components/ui/text-action";

export type NeighborProject = {
  href: string;
  title: string;
};

type ProjectViewMode = "slideshow" | "thumbnails";

type ProjectViewToggleProps = {
  activeView: ProjectViewMode;
  otherHref: string;
  className?: string;
  separatorClassName?: string;
  activeLabelClassName?: string;
  linkClassName?: string;
  linkTestId?: string;
  ariaLabel?: string;
};

export function ProjectViewToggle({
  activeView,
  otherHref,
  className,
  separatorClassName,
  activeLabelClassName,
  linkClassName,
  linkTestId,
  ariaLabel = "Project view",
}: ProjectViewToggleProps) {
  const otherView = activeView === "slideshow" ? "thumbnails" : "slideshow";

  return (
    <div className={classNames(className)} aria-label={ariaLabel}>
      <TextActionLabel
        className={activeLabelClassName}
        underline="underline"
      >
        {activeView}
      </TextActionLabel>
      <span className={classNames(separatorClassName)} aria-hidden="true">
        /
      </span>
      <TextActionLink
        href={otherHref}
        underline="hover"
        className={linkClassName}
        data-testid={linkTestId}
      >
        {otherView}
      </TextActionLink>
    </div>
  );
}

type NextProjectTextLinkProps = {
  nextProject: NeighborProject | null;
  className?: string;
  testId?: string;
};

export function NextProjectTextLink({
  nextProject,
  className,
  testId,
}: NextProjectTextLinkProps) {
  if (!nextProject) {
    return null;
  }

  return (
    <TextActionLink
      href={nextProject.href}
      underline="hover"
      className={className}
      data-testid={testId}
    >
      next project -&gt; {nextProject.title}
    </TextActionLink>
  );
}
