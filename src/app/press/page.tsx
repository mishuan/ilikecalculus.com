import { Reveal } from "@/components/reveal";
import { siteData } from "@/data/site-content";

export default function PressPage() {
  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Press Coverage</h1>
      </header>

      <div className="press-list">
        {siteData.press.map((item) => (
          <Reveal key={item.url}>
            <article className="press-item">
              <p className="press-item__outlet">{item.outlet}</p>
              <a href={item.url} target="_blank" rel="noreferrer" className="press-item__link">
                {item.title}
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
