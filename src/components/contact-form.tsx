"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { classNames } from "@/components/ui/class-names";
import { siteData } from "@/data/site-content";
import { ExternalTextLink } from "@/components/ui/text-action";
import { SurfaceButton } from "@/components/ui/surface-button";
import { isValidContactEmail, parseContactSubmission } from "@/lib/contact-schema";

type ContactState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ContactField = "name" | "email" | "subject" | "message";
type ContactFieldErrors = Partial<Record<ContactField, string>>;

const CONTACT_FIELDS: ContactField[] = ["name", "email", "subject", "message"];
const REQUIRED_FIELD_MESSAGE = "Please fill out this field.";
const INVALID_EMAIL_MESSAGE = "Please enter a valid email address.";

const INITIAL_STATE: ContactState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

function validateContactField(field: ContactField, form: ContactState) {
  const value = form[field].trim();

  if (!value) {
    return REQUIRED_FIELD_MESSAGE;
  }

  if (field === "email" && !isValidContactEmail(value)) {
    return INVALID_EMAIL_MESSAGE;
  }

  return null;
}

function validateContactFields(form: ContactState): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  for (const field of CONTACT_FIELDS) {
    const message = validateContactField(field, form);
    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

export function ContactForm() {
  const [form, setForm] = useState<ContactState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const fieldRefs = useRef<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>({
    name: null,
    email: null,
    subject: null,
    message: null,
  });
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

  function updateField(field: ContactField, value: string) {
    setForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      setFieldErrors((currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors;
        }

        const nextFieldMessage = validateContactField(field, next);
        if (!nextFieldMessage) {
          const nextErrors = { ...currentErrors };
          delete nextErrors[field];
          return nextErrors;
        }

        if (currentErrors[field] === nextFieldMessage) {
          return currentErrors;
        }

        return {
          ...currentErrors,
          [field]: nextFieldMessage,
        };
      });

      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const validationErrors = validateContactFields(form);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const firstInvalidField = CONTACT_FIELDS.find((field) => validationErrors[field]);
      if (firstInvalidField) {
        fieldRefs.current[firstInvalidField]?.focus();
      }
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const parsed = parseContactSubmission(form);
    if (!parsed.ok) {
      setStatus({
        ok: false,
        message: parsed.message,
      });
      setIsSubmitting(false);
      return;
    }

    if (parsed.isSpam) {
      setStatus({
        ok: true,
        message: "Message sent.",
      });
      setForm(INITIAL_STATE);
      setFieldErrors({});
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(parsed.payload),
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
      setFieldErrors({});
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
      <p className="contact-panel__description body-copy">
        For collaborations and inquiries, you can send a message here or reach out on{" "}
        <ExternalTextLink
          href={siteData.site.instagramUrl}
          className="contact-panel__description-link"
        >
          instagram
        </ExternalTextLink>
        . Blog posts and updates live on{" "}
        <ExternalTextLink
          href={siteData.site.blogUrl}
          className="contact-panel__description-link"
        >
          substack
        </ExternalTextLink>
        .
      </p>
      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <div className="contact-form__row">
          <label className={classNames("contact-form__field", fieldErrors.name && "contact-form__field--error")}>
            <span>name</span>
            <input
              ref={(node) => {
                fieldRefs.current.name = node;
              }}
              type="text"
              name="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="name"
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? "contact-form-field-error-name" : undefined}
              required
            />
            {fieldErrors.name ? (
              <p id="contact-form-field-error-name" className="contact-form__field-note hover-note" role="alert">
                {fieldErrors.name}
              </p>
            ) : null}
          </label>

          <label className={classNames("contact-form__field", fieldErrors.email && "contact-form__field--error")}>
            <span>email</span>
            <input
              ref={(node) => {
                fieldRefs.current.email = node;
              }}
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "contact-form-field-error-email" : undefined}
              required
            />
            {fieldErrors.email ? (
              <p id="contact-form-field-error-email" className="contact-form__field-note hover-note" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </label>
        </div>

        <label className={classNames("contact-form__field", fieldErrors.subject && "contact-form__field--error")}>
          <span>subject</span>
          <input
            ref={(node) => {
              fieldRefs.current.subject = node;
            }}
            type="text"
            name="subject"
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            aria-invalid={fieldErrors.subject ? true : undefined}
            aria-describedby={fieldErrors.subject ? "contact-form-field-error-subject" : undefined}
            required
          />
          {fieldErrors.subject ? (
            <p id="contact-form-field-error-subject" className="contact-form__field-note hover-note" role="alert">
              {fieldErrors.subject}
            </p>
          ) : null}
        </label>

        <label className={classNames("contact-form__field", fieldErrors.message && "contact-form__field--error")}>
          <span>message</span>
          <textarea
            ref={(node) => {
              messageRef.current = node;
              fieldRefs.current.message = node;
            }}
            name="message"
            rows={1}
            value={form.message}
            onChange={(event) => {
              resizeMessageField(event.currentTarget);
              updateField("message", event.target.value);
            }}
            aria-invalid={fieldErrors.message ? true : undefined}
            aria-describedby={fieldErrors.message ? "contact-form-field-error-message" : undefined}
            required
          />
          {fieldErrors.message ? (
            <p id="contact-form-field-error-message" className="contact-form__field-note hover-note" role="alert">
              {fieldErrors.message}
            </p>
          ) : null}
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
          <SurfaceButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "sending..." : "send message"}
          </SurfaceButton>
          {status ? (
            <p className={classNames("contact-form__status", status.ok ? "is-success" : "is-error")}>
              {status.message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
