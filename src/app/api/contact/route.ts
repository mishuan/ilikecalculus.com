import { NextResponse } from "next/server";
import { parseContactSubmission } from "@/lib/contact-schema";

const DEFAULT_TO_EMAIL = "michael@ilikecalculus.com";
const DEFAULT_FROM_EMAIL = "contact form <onboarding@resend.dev>";

export async function POST(request: Request) {
  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseContactSubmission(rawPayload);
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 });
  }

  if (parsed.isSpam) {
    return NextResponse.json({ message: "Message sent." }, { status: 200 });
  }

  const { name, email, subject, message } = parsed.payload;

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
