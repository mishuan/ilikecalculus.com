"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { isClientEditorAvailable } from "@/lib/editor-client";

export function useEditMode() {
  const searchParams = useSearchParams();
  const isEditorAvailable = isClientEditorAvailable();

  return useMemo(
    () => isEditorAvailable && searchParams?.get("edit") === "1",
    [isEditorAvailable, searchParams],
  );
}
