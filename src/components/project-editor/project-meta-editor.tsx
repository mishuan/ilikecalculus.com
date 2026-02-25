"use client";

type ProjectMetaEditorProps = {
  isEditMode: boolean;
  title: string;
  description: string;
  fallbackDescription: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTitleBlur: () => void;
  onDescriptionBlur: () => void;
};

export function ProjectMetaEditor({
  isEditMode,
  title,
  description,
  fallbackDescription,
  onTitleChange,
  onDescriptionChange,
  onTitleBlur,
  onDescriptionBlur,
}: ProjectMetaEditorProps) {
  return (
    <>
      {isEditMode ? (
        <input
          className="page-title page-title--inline-edit"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          onBlur={onTitleBlur}
          aria-label="Project title"
        />
      ) : (
        <h1 className="page-title">{title}</h1>
      )}

      {isEditMode ? (
        <textarea
          className="page-intro page-intro--inline-edit"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          onBlur={onDescriptionBlur}
          aria-label="Project description"
          placeholder={fallbackDescription}
        />
      ) : (
        <p className="page-intro">{description || fallbackDescription}</p>
      )}
    </>
  );
}
