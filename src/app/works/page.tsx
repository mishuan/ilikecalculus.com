import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { projects } from "@/data/site-content";

export default function WorksPage() {
  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Projects</p>
        <h1 className="page-title">All Work</h1>
      </header>

      <div className="work-grid">
        {projects.map((project, index) => (
          <Reveal key={project.slug}>
            <ProjectCard project={project} priority={index < 3} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
