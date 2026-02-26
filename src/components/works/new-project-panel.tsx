"use client";

import {
  EditorButton,
  EditorChip,
  EditorInput,
  EditorTextarea,
} from "@/components/ui/editor-controls";
import { TextActionLink } from "@/components/ui/text-action";

type NewProjectPanelProps = {
  isEditMode: boolean;
  canRender: boolean;
  availableCategories: string[];
  newProjectTitle: string;
  newProjectSlug: string;
  newProjectDescription: string;
  newProjectCategories: string[];
  isCreatingProject: boolean;
  newProjectLink: { slug: string; category: string } | null;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onToggleCategory: (category: string) => void;
  onCreateProject: () => void;
};

export function NewProjectPanel({
  isEditMode,
  canRender,
  availableCategories,
  newProjectTitle,
  newProjectSlug,
  newProjectDescription,
  newProjectCategories,
  isCreatingProject,
  newProjectLink,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onToggleCategory,
  onCreateProject,
}: NewProjectPanelProps) {
  if (!isEditMode || !canRender) {
    return null;
  }

  return (
    <section className="works-new-project" aria-label="Create new project">
      <header className="works-new-project__header">
        <span className="works-new-project__plus">+</span>
        <h2 className="works-new-project__title">new empty project</h2>
      </header>

      <div className="works-new-project__fields">
        <EditorInput
          value={newProjectTitle}
          className="works-new-project__input"
          placeholder="project title"
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <EditorInput
          value={newProjectSlug}
          className="works-new-project__input"
          placeholder="project-slug"
          onChange={(event) => onSlugChange(event.target.value)}
        />
      </div>

      <EditorTextarea
        value={newProjectDescription}
        className="works-new-project__description"
        placeholder="project description"
        onChange={(event) => onDescriptionChange(event.target.value)}
      />

      <div className="project-thumbnails__category-list">
        {availableCategories.map((category) => {
          const isSelected = newProjectCategories.includes(category);
          return (
            <EditorChip
              key={category}
              selected={isSelected}
              onClick={() => onToggleCategory(category)}
            >
              {category}
            </EditorChip>
          );
        })}
      </div>

      <div className="works-new-project__actions">
        <EditorButton disabled={isCreatingProject} onClick={onCreateProject}>
          {isCreatingProject ? "creating..." : "create project"}
        </EditorButton>

        {newProjectLink ? (
          <TextActionLink href={`/works/${newProjectLink.category}/${newProjectLink.slug}/thumbnails?edit=1`}>
            open new project
          </TextActionLink>
        ) : null}
      </div>
    </section>
  );
}
