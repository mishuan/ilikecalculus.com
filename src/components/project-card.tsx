import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/site-content";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
};

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article className="work-card">
      <Link href={`/works/${project.slug}`} className="work-card__media" aria-label={`Open ${project.title}`}>
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

      <div className="work-card__meta">
        <h2 className="work-card__title">
          <Link href={`/works/${project.slug}`}>{project.title}</Link>
        </h2>
        {project.description ? <p className="work-card__description">{project.description}</p> : null}
        <p className="work-card__count">{project.images.length} photos</p>
      </div>
    </article>
  );
}
