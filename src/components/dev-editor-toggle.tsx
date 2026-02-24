"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isClientEditorAvailable } from "@/lib/editor-client";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return true;
  }

  if (target instanceof HTMLSelectElement) {
    return true;
  }

  return target.isContentEditable || Boolean(target.closest("[contenteditable='true']"));
}

export function DevEditorToggle() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditorAvailable = isClientEditorAvailable();
  const isEditing = useMemo(() => searchParams?.get("edit") === "1", [searchParams]);

  const onToggle = useCallback(() => {
    if (!isEditorAvailable) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    if (isEditing) {
      nextParams.delete("edit");
    } else {
      nextParams.set("edit", "1");
    }

    const query = nextParams.toString();
    const href = query.length > 0 ? `${pathname}?${query}` : pathname;
    router.replace(href, { scroll: false });
  }, [isEditing, isEditorAvailable, pathname, router, searchParams]);

  useEffect(() => {
    if (!isEditorAvailable) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const usesShortcutModifier = event.metaKey || event.ctrlKey;
      if (!usesShortcutModifier || !event.shiftKey) {
        return;
      }

      if (event.key.toLowerCase() !== "e") {
        return;
      }

      event.preventDefault();
      onToggle();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isEditorAvailable, onToggle]);

  if (!isEditorAvailable) {
    return null;
  }

  return (
    <button
      type="button"
      className={`dev-editor-toggle${isEditing ? " dev-editor-toggle--active" : ""}`}
      onClick={onToggle}
    >
      {isEditing ? "exit edit mode" : "edit mode"} (cmd/ctrl+shift+e)
    </button>
  );
}
