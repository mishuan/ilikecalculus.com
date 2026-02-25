"use client";

import type { ChangeEvent, DragEvent, RefObject } from "react";
import { classNames } from "@/components/ui/class-names";

type ProjectPhotoUploaderProps = {
  isEditMode: boolean;
  uploadInputRef: RefObject<HTMLInputElement | null>;
  isUploadingPhoto: boolean;
  isUploadDragOver: boolean;
  onUploadInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadDrop: (event: DragEvent<HTMLButtonElement>) => void;
  onUploadDragOver: (event: DragEvent<HTMLButtonElement>) => void;
  onUploadDragLeave: () => void;
  onOpenPhotoPicker: () => void;
};

export function ProjectPhotoUploader({
  isEditMode,
  uploadInputRef,
  isUploadingPhoto,
  isUploadDragOver,
  onUploadInputChange,
  onUploadDrop,
  onUploadDragOver,
  onUploadDragLeave,
  onOpenPhotoPicker,
}: ProjectPhotoUploaderProps) {
  if (!isEditMode) {
    return null;
  }

  return (
    <>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="project-thumbnails__upload-input"
        onChange={onUploadInputChange}
      />
      <button
        type="button"
        className={classNames(
          "project-thumbnails__upload-dropzone",
          isUploadDragOver && "project-thumbnails__upload-dropzone--active",
        )}
        onClick={onOpenPhotoPicker}
        onDragOver={onUploadDragOver}
        onDragLeave={onUploadDragLeave}
        onDrop={onUploadDrop}
        disabled={isUploadingPhoto}
      >
        <span className="project-thumbnails__upload-plus">+</span>
        <span className="project-thumbnails__upload-title">add photo</span>
        <span className="project-thumbnails__upload-hint">click or drag an image file here</span>
      </button>
    </>
  );
}
