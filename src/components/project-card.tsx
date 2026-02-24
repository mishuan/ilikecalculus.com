import Image from "next/image";
import Link from "next/link";
import { projectHref, type Project, type ProjectCategory } from "@/data/site-content";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
  preferredCategory?: ProjectCategory;
};

export function ProjectCard({ project, priority = false, preferredCategory }: ProjectCardProps) {
  const href = projectHref(project, preferredCategory);

  return (
    <article className="work-card">
      {project.coverImage ? (
        <Link href={href} className="work-card__media" aria-label={`Open ${project.title}`}>
          <Image
            src={project.coverImage.src}
            alt={project.coverImage.alt || project.title}
            width={project.coverImage.width}
            height={project.coverImage.height}
            priority={priority}
            className="work-card__image"
            sizes="(max-width: 960px) 100vw, (max-width: 1400px) 48vw, 36vw"
          />
        </Link>
      ) : (
        <Link href={href} className="work-card__media work-card__media--empty" aria-label={`Open ${project.title}`}>
          <span className="work-card__placeholder">no cover yet</span>
        </Link>
      )}

      <div className="work-card__meta">
        <h2 className="work-card__title">
          <Link href={href}>{project.title}</Link>
        </h2>
        {project.description ? <p className="work-card__description">{project.description}</p> : null}
        <p className="work-card__count">{project.images.length} photos</p>
      </div>
    </article>
  );
}
