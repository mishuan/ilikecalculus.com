import Link from "next/link";
import { ProjectCollageGrid } from "@/components/project-collage-grid";
import {
  projectHref,
  type Project,
  type ProjectCategory,
} from "@/data/site-content";

type ProjectThumbnailsViewProps = {
  project: Project;
  activeCategory: ProjectCategory;
  activePhoto?: number;
  nextProject: {
    href: string;
    title: string;
  } | null;
};

export function ProjectThumbnailsView({
  project,
  activeCategory,
  activePhoto,
  nextProject,
}: ProjectThumbnailsViewProps) {
  const slideshowHref = activePhoto
    ? `${projectHref(project, activeCategory)}?photo=${activePhoto}`
    : projectHref(project, activeCategory);

  return (
    <section className="page page--wide project-thumbnails">
      <header className="page-header">
        <h1 className="page-title">{project.title}</h1>
        <p className="page-intro">
          {project.description || `${project.images.length} photographs in this collection.`}
        </p>
        <div className="project-thumbnails__actions">
          <Link
            href={slideshowHref}
            className="text-action text-action--default text-action--underline"
            data-testid="thumbnail-page-slideshow-link"
          >
            slideshow
          </Link>
          {nextProject ? (
            <Link
              href={nextProject.href}
              className="text-action text-action--default text-action--underline"
              data-testid="thumbnail-page-next-project-link"
            >
              next project: {nextProject.title}
            </Link>
          ) : null}
        </div>
      </header>

      <ProjectCollageGrid project={project} activeCategory={activeCategory} />
    </section>
  );
}
