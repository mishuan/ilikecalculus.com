type ContactPayloadRecord = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
};

export type ContactSubmission = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ContactSubmissionParseError = {
  ok: false;
  message: string;
};

type ContactSubmissionParseSuccess = {
  ok: true;
  payload: ContactSubmission;
  isSpam: boolean;
};

export type ContactSubmissionParseResult = ContactSubmissionParseError | ContactSubmissionParseSuccess;

const NAME_MAX_LENGTH = 120;
const SUBJECT_MAX_LENGTH = 160;
const MESSAGE_MAX_LENGTH = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isValidContactEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseContactSubmission(rawValue: unknown): ContactSubmissionParseResult {
  if (!isRecord(rawValue)) {
    return {
      ok: false,
      message: "Invalid request body.",
    };
  }

  const payload = rawValue as ContactPayloadRecord;
  const parsed: ContactSubmission = {
    name: cleanText(payload.name),
    email: cleanText(payload.email),
    subject: cleanText(payload.subject),
    message: cleanText(payload.message),
    website: cleanText(payload.website),
  };

  if (parsed.website.length > 0) {
    return {
      ok: true,
      payload: parsed,
      isSpam: true,
    };
  }

  if (!parsed.name || !parsed.email || !parsed.subject || !parsed.message) {
    return {
      ok: false,
      message: "Please complete all required fields.",
    };
  }

  if (!isValidContactEmail(parsed.email)) {
    return {
      ok: false,
      message: "Please provide a valid email address.",
    };
  }

  if (
    parsed.name.length > NAME_MAX_LENGTH ||
    parsed.subject.length > SUBJECT_MAX_LENGTH ||
    parsed.message.length > MESSAGE_MAX_LENGTH
  ) {
    return {
      ok: false,
      message: "Message is too long.",
    };
  }

  return {
    ok: true,
    payload: parsed,
    isSpam: false,
  };
}
