"use client";

import { EditorStatus } from "@/components/ui/editor-controls";
import {
  NextProjectTextLink,
  type NeighborProject,
  ProjectViewToggle,
} from "@/components/project-navigation";

type ProjectActionsProps = {
  slideshowHref: string;
  nextProject: NeighborProject | null;
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
      <ProjectViewToggle
        activeView="thumbnails"
        otherHref={slideshowHref}
        className="project-thumbnails__view-toggle"
        separatorClassName="project-thumbnails__view-separator"
        linkTestId="thumbnail-page-slideshow-link"
      />

      <NextProjectTextLink nextProject={nextProject} testId="thumbnail-page-next-project-link" />

      {isEditMode && (isLoadingEditorState || isSavingInline || isUploadingPhoto || isSavingPhotoOrder) ? (
        <EditorStatus>saving...</EditorStatus>
      ) : null}
      {isEditMode && inlineStatus ? <EditorStatus>{inlineStatus}</EditorStatus> : null}
      {isEditMode && inlineError ? <EditorStatus tone="error">{inlineError}</EditorStatus> : null}
    </div>
  );
}
