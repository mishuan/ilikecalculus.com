import { ContactForm } from "@/components/contact-form";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { siteData } from "@/data/site-content";

export default function ContactPage() {
  return (
    <section className="page page--contact">
      <header className="page-header">
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
              <p className="body-copy contact-copy__paragraph">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
