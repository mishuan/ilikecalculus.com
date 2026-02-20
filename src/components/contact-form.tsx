"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { siteData } from "@/data/site-content";
import { TextActionLink } from "@/components/ui/text-action";

type ContactState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const INITIAL_STATE: ContactState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const [form, setForm] = useState<ContactState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  function resizeMessageField(target: HTMLTextAreaElement) {
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  }

  useEffect(() => {
    if (messageRef.current) {
      resizeMessageField(messageRef.current);
    }
  }, [form.message]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus({
          ok: false,
          message: payload.message || "Could not send your message. Please try again.",
        });
        return;
      }

      setStatus({
        ok: true,
        message: payload.message || "Message sent. Thanks for reaching out.",
      });
      setForm(INITIAL_STATE);
    } catch {
      setStatus({
        ok: false,
        message: "Could not send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="contact-panel">
      <h2 className="panel-title">send a message</h2>
      <p className="contact-panel__description">
        for collaborations and inquiries, you can send a message here or reach out on instagram. blog
        posts and updates live on substack.
      </p>
      <div className="contact-panel__links" aria-label="external contact channels">
        <TextActionLink href={siteData.site.instagramUrl} target="_blank" rel="noreferrer" className="contact-panel__link">
          instagram
        </TextActionLink>
        <span className="contact-panel__divider" aria-hidden="true">
          /
        </span>
        <TextActionLink href={siteData.site.blogUrl} target="_blank" rel="noreferrer" className="contact-panel__link">
          substack
        </TextActionLink>
      </div>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="contact-form__row">
          <label className="contact-form__field">
            <span>name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              autoComplete="name"
              required
            />
          </label>

          <label className="contact-form__field">
            <span>email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </label>
        </div>

        <label className="contact-form__field">
          <span>subject</span>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            required
          />
        </label>

        <label className="contact-form__field">
          <span>message</span>
          <textarea
            ref={messageRef}
            name="message"
            rows={1}
            value={form.message}
            onChange={(event) => {
              resizeMessageField(event.currentTarget);
              setForm((current) => ({ ...current, message: event.target.value }));
            }}
            required
          />
        </label>

        <label className="contact-form__honeypot" aria-hidden="true">
          <span>website</span>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
          />
        </label>

        <div className="contact-form__footer">
          <button className="contact-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "sending..." : "send message"}
          </button>
          {status ? (
            <p className={`contact-form__status${status.ok ? " is-success" : " is-error"}`}>{status.message}</p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
