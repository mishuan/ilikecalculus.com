import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { featuredProjects } from "@/data/site-content";

export default function HomePage() {
  return (
    <section className="page">
      <header className="page-header page-header--hero">
        <p className="eyebrow">Portfolio</p>
        <h1 className="page-title">Selected Works</h1>
        <p className="page-intro">
          A minimal archive of photographic projects focused on structure, form, and quiet human presence.
        </p>
      </header>

      <div className="work-grid">
        {featuredProjects.map((project, index) => (
          <Reveal key={project.slug}>
            <ProjectCard project={project} priority={index < 2} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
