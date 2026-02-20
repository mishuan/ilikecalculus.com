"use client";

import { Fragment, useMemo, useState } from "react";
import { ProjectCollageRow } from "@/components/project-collage-row";
import { Reveal } from "@/components/reveal";
import { TextActionButton } from "@/components/ui/text-action";
import {
  categoryLabels,
  categoryOrder,
  projects,
  type ProjectCategory,
} from "@/data/site-content";

export function WorksIndex() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory | "all">("all");
  const filterOptions: Array<{ value: ProjectCategory | "all"; label: string }> = [
    { value: "all", label: "all" },
    ...categoryOrder.map((category) => ({
      value: category,
      label: categoryLabels[category],
    })),
  ];
  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        activeFilter === "all"
          ? true
          : project.categories.some((category) => category === activeFilter),
      ),
    [activeFilter],
  );

  return (
    <section className="page page--wide">
      <header className="works-intro">
        <h1 className="works-intro__title">works</h1>
        <div className="works-intro__nav" role="group" aria-label="work filters">
          {filterOptions.map((option, index) => (
            <Fragment key={option.value}>
              {index > 0 ? <span className="works-intro__separator" aria-hidden="true">-</span> : null}
              <TextActionButton
                className="works-intro__link"
                tone={activeFilter === option.value ? "default" : "muted"}
                underline={activeFilter === option.value ? "underline" : "none"}
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </TextActionButton>
            </Fragment>
          ))}
        </div>
      </header>

      <div className="category-section__rows">
        {filteredProjects.map((project) => (
          <Reveal key={`${activeFilter}-${project.slug}`}>
            <ProjectCollageRow
              project={project}
              preferredCategory={activeFilter === "all" ? undefined : activeFilter}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
