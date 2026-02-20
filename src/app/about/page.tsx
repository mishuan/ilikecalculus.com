import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { siteData } from "@/data/site-content";

export default function AboutPage() {
  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">{siteData.about.title}</h1>
      </header>

      <div className="split-layout">
        <Reveal className="split-layout__media">
          <Image
            src={siteData.about.image.src}
            alt={siteData.about.image.alt}
            width={siteData.about.image.width}
            height={siteData.about.image.height}
            priority
            className="portrait-image"
            sizes="(max-width: 960px) 100vw, 38vw"
          />
        </Reveal>

        <div className="split-layout__content">
          {siteData.about.paragraphs.map((paragraph) => (
            <Reveal key={paragraph}>
              <p className="body-copy">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
