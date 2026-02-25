"use client";

import { EditorStatus } from "@/components/ui/editor-controls";
import { TextActionLabel, TextActionLink } from "@/components/ui/text-action";

type ProjectActionsProps = {
  slideshowHref: string;
  nextProject: {
    href: string;
    title: string;
  } | null;
  isEditMode: boolean;
  isLoadingEditorState: boolean;
  isSavingInline: boolean;
  isUploadingPhoto: boolean;
  isSavingPhotoOrder: boolean;
  inlineStatus: string;
  inlineError: string;
};

export function ProjectActions({
  slideshowHref,
  nextProject,
  isEditMode,
  isLoadingEditorState,
  isSavingInline,
  isUploadingPhoto,
  isSavingPhotoOrder,
  inlineStatus,
  inlineError,
}: ProjectActionsProps) {
  return (
    <div className="project-thumbnails__actions">
      <div className="project-thumbnails__view-toggle" aria-label="Project view">
        <TextActionLabel underline="underline">thumbnails</TextActionLabel>
        <span className="project-thumbnails__view-separator" aria-hidden="true">
          /
        </span>
        <TextActionLink href={slideshowHref} underline="hover" data-testid="thumbnail-page-slideshow-link">
          slideshow
        </TextActionLink>
      </div>

      {nextProject ? (
        <TextActionLink href={nextProject.href} underline="hover" data-testid="thumbnail-page-next-project-link">
          next project -&gt; {nextProject.title}
        </TextActionLink>
      ) : null}

      {isEditMode && (isLoadingEditorState || isSavingInline || isUploadingPhoto || isSavingPhotoOrder) ? (
        <EditorStatus>saving...</EditorStatus>
      ) : null}
      {isEditMode && inlineStatus ? <EditorStatus>{inlineStatus}</EditorStatus> : null}
      {isEditMode && inlineError ? <EditorStatus tone="error">{inlineError}</EditorStatus> : null}
    </div>
  );
}
