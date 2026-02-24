import { NextResponse } from "next/server";

export function isEditorEnabled() {
  return process.env.NODE_ENV === "development";
}

export function editorGuardResponse() {
  if (!isEditorEnabled()) {
    return NextResponse.json(
      {
        error: "Editor APIs are only available in development mode.",
      },
      { status: 403 },
    );
  }

  return null;
}
