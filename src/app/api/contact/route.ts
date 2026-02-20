import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
};

const DEFAULT_TO_EMAIL = "michael@ilikecalculus.com";
const DEFAULT_FROM_EMAIL = "contact form <onboarding@resend.dev>";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const name = cleanText(payload.name);
  const email = cleanText(payload.email);
  const subject = cleanText(payload.subject);
  const message = cleanText(payload.message);
  const website = cleanText(payload.website);

  if (website.length > 0) {
    return NextResponse.json({ message: "Message sent." }, { status: 200 });
  }

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Please provide a valid email address." }, { status: 400 });
  }

  if (subject.length > 160 || message.length > 5000 || name.length > 120) {
    return NextResponse.json({ message: "Message is too long." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY for /api/contact");
    return NextResponse.json({ message: "Contact form is not configured yet." }, { status: 500 });
  }

  const emailBody = [
    `name: ${name}`,
    `email: ${email}`,
    "",
    message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[contact] ${subject}`,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Resend API error:", errorBody);
      return NextResponse.json({ message: "Could not send your message. Please try again." }, { status: 502 });
    }
  } catch (error) {
    console.error("Contact form send failure:", error);
    return NextResponse.json({ message: "Could not send your message. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ message: "Message sent. Thanks for reaching out." }, { status: 200 });
}
