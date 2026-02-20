import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { projects, projectsBySlug } from "@/data/site-content";

type ProjectPageProps = {
  params: Promise<{
    project: string;
  }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({ project: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { project } = await params;
  const currentProject = projectsBySlug[project];

  if (!currentProject) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${currentProject.title} | Michael Yuan`,
    description: currentProject.description || `Photography project: ${currentProject.title}`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { project } = await params;
  const currentProject = projectsBySlug[project];

  if (!currentProject) {
    notFound();
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Work</p>
        <h1 className="page-title">{currentProject.title}</h1>
        {currentProject.description ? (
          <p className="page-intro">{currentProject.description}</p>
        ) : (
          <p className="page-intro">{currentProject.images.length} photographs in this collection.</p>
        )}
      </header>

      <div className="project-gallery">
        {currentProject.images.map((image, index) => (
          <Reveal key={image.src}>
            <figure className="project-figure">
              <Image
                src={image.src}
                alt={image.alt || `${currentProject.title} photograph ${index + 1}`}
                width={image.width}
                height={image.height}
                priority={index < 2}
                className="project-image"
                sizes="(max-width: 960px) 100vw, 68vw"
              />
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
