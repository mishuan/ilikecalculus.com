"use client";

import { SegmentedTextToggle } from "@/components/ui/segmented-text-toggle";
import { TextActionLink } from "@/components/ui/text-action";

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
  const options: Array<{ value: ProjectViewMode; label: string; href?: string; testId?: string }> = [
    {
      value: activeView,
      label: activeView,
    },
    {
      value: otherView,
      label: otherView,
      href: otherHref,
      testId: linkTestId,
    },
  ];

  return (
    <SegmentedTextToggle
      value={activeView}
      options={options}
      ariaLabel={ariaLabel}
      className={className}
      itemClassName={linkClassName}
      selectedItemClassName={activeLabelClassName}
      separatorClassName={separatorClassName}
    />
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
