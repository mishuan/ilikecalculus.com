import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { siteData } from "@/data/site-content";

export default function ContactPage() {
  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title">Let&apos;s Talk</h1>
      </header>

      <Reveal>
        <Image
          src={siteData.contact.image.src}
          alt={siteData.contact.image.alt}
          width={siteData.contact.image.width}
          height={siteData.contact.image.height}
          className="banner-image"
          priority
          sizes="(max-width: 960px) 100vw, 68vw"
        />
      </Reveal>

      <div className="contact-grid">
        <div className="contact-copy">
          {siteData.contact.paragraphs.map((paragraph) => (
            <Reveal key={paragraph}>
              <p className="body-copy">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="contact-panel">
            <h2 className="panel-title">Best Channels</h2>
            <p>
              For collaborations and inquiries, reach out on Instagram first. Blog posts and updates live on
              Substack.
            </p>
            <div className="panel-actions">
              <a href={siteData.site.instagramUrl} target="_blank" rel="noreferrer" className="button-link">
                Instagram
              </a>
              <a href={siteData.site.blogUrl} target="_blank" rel="noreferrer" className="button-link">
                Substack
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
