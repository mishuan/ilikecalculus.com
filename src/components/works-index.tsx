"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectCollageRow } from "@/components/project-collage-row";
import { Reveal } from "@/components/reveal";
import { TextActionButton } from "@/components/ui/text-action";
import type { EditorStateResponse } from "@/data/content-types";
import {
  categoryLabels,
  categoryOrder,
  projects,
  type ProjectCategory,
} from "@/data/site-content";
import { useEditMode } from "@/hooks/use-edit-mode";

type EditorStatePayload = EditorStateResponse & {
  error?: string;
  createdProject?: {
    slug: string;
    categories: string[];
  };
};

function normalizeSlug(rawValue: string) {
  return rawValue
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function reorderByValue(values: string[], draggingValue: string, targetValue: string) {
  const startIndex = values.indexOf(draggingValue);
  const targetIndex = values.indexOf(targetValue);
  if (startIndex < 0 || targetIndex < 0 || startIndex === targetIndex) {
    return values;
  }

  const next = [...values];
  const [dragged] = next.splice(startIndex, 1);
  next.splice(targetIndex, 0, dragged);
  return next;
}

export function WorksIndex() {
  const router = useRouter();
  const isEditMode = useEditMode();

  const [activeFilter, setActiveFilter] = useState<string | "all">("all");
  const [editorState, setEditorState] = useState<EditorStateResponse | null>(null);
  const [editorError, setEditorError] = useState("");
  const [editorStatus, setEditorStatus] = useState("");
  const [isEditorLoading, setIsEditorLoading] = useState(false);

  const [projectOrderDraft, setProjectOrderDraft] = useState<string[]>([]);
  const [categoryOrderDraft, setCategoryOrderDraft] = useState<string[]>([]);
  const [draggingProjectSlug, setDraggingProjectSlug] = useState<string | null>(null);
  const [draggingCategory, setDraggingCategory] = useState<string | null>(null);
  const [isSavingProjectOrder, setIsSavingProjectOrder] = useState(false);
  const [isSavingCategoryOrder, setIsSavingCategoryOrder] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isProjectSlugDirty, setIsProjectSlugDirty] = useState(false);
  const [newProjectCategories, setNewProjectCategories] = useState<string[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectLink, setNewProjectLink] = useState<{ slug: string; category: string } | null>(null);

  const refreshEditorState = async () => {
    setIsEditorLoading(true);
    setEditorError("");

    try {
      const response = await fetch("/api/editor/state", {
        cache: "no-store",
      });
      const payload = (await response.json()) as EditorStatePayload;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load editor state");
      }

      setEditorState(payload);
      setProjectOrderDraft(payload.workspace.projectOrder);
      setCategoryOrderDraft(payload.workspace.categories);
      setEditorStatus("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load editor state";
      setEditorError(message);
    } finally {
      setIsEditorLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      setEditorState(null);
      setEditorError("");
      setEditorStatus("");
      setProjectOrderDraft([]);
      setCategoryOrderDraft([]);
      setNewProjectDescription("");
      setNewProjectCategories([]);
      setNewProjectLink(null);
      return;
    }
    void refreshEditorState();
  }, [isEditMode]);

  useEffect(() => {
    if (activeFilter === "all") {
      return;
    }

    const available = isEditMode && editorState ? categoryOrderDraft : categoryOrder;
    if (!available.includes(activeFilter)) {
      setActiveFilter("all");
    }
  }, [activeFilter, categoryOrderDraft, editorState, isEditMode]);

  useEffect(() => {
    if (categoryOrderDraft.length === 0) {
      return;
    }
    setNewProjectCategories((current) => {
      const filtered = current.filter((category) => categoryOrderDraft.includes(category));
      if (filtered.length > 0) {
        return filtered;
      }
      return [categoryOrderDraft[0]];
    });
  }, [categoryOrderDraft]);

  const availableCategories = isEditMode && editorState
    ? categoryOrderDraft
    : categoryOrder;

  const filterOptions: Array<{ value: string | "all"; label: string }> = [
    { value: "all", label: "all" },
    ...availableCategories.map((category) => ({
      value: category,
      label: categoryLabels[category as ProjectCategory] ?? category,
    })),
  ];

  const visibleProjects = useMemo(() => {
    if (!isEditMode || !editorState) {
      return projects;
    }

    const projectBySlug = new Map(editorState.projects.map((project) => [project.slug, project]));
    const ordered = projectOrderDraft
      .map((slug) => projectBySlug.get(slug))
      .filter((project): project is NonNullable<typeof project> => Boolean(project));

    if (ordered.length === editorState.projects.length) {
      return ordered;
    }

    return editorState.projects;
  }, [editorState, isEditMode, projectOrderDraft]);

  const filteredProjects = useMemo(
    () =>
      visibleProjects.filter((project) =>
        activeFilter === "all"
          ? true
          : project.categories.some((category) => category === activeFilter),
      ),
    [activeFilter, visibleProjects],
  );

  const persistProjectOrder = async (nextOrder: string[], fallbackOrder: string[]) => {
    if (!isEditMode || !editorState) {
      return;
    }

    setIsSavingProjectOrder(true);
    setEditorError("");
    setEditorStatus("");

    try {
      const response = await fetch("/api/editor/projects/order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectOrder: nextOrder,
        }),
      });
      const payload = (await response.json()) as EditorStatePayload;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save project order");
      }

      setEditorState(payload);
      setProjectOrderDraft(payload.workspace.projectOrder);
      setEditorStatus("Project order saved.");
      router.refresh();
    } catch (error) {
      setProjectOrderDraft(fallbackOrder);
      const message = error instanceof Error ? error.message : "Unable to save project order";
      setEditorError(message);
    } finally {
      setIsSavingProjectOrder(false);
    }
  };

  const persistCategoryOrder = async (nextOrder: string[], fallbackOrder: string[]) => {
    if (!isEditMode || !editorState) {
      return;
    }

    setIsSavingCategoryOrder(true);
    setEditorError("");
    setEditorStatus("");

    try {
      const response = await fetch("/api/editor/categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories: nextOrder,
        }),
      });
      const payload = (await response.json()) as EditorStatePayload;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save category order");
      }

      setEditorState(payload);
      setCategoryOrderDraft(payload.workspace.categories);
      setEditorStatus("Category order saved.");
      router.refresh();
    } catch (error) {
      setCategoryOrderDraft(fallbackOrder);
      const message = error instanceof Error ? error.message : "Unable to save category order";
      setEditorError(message);
    } finally {
      setIsSavingCategoryOrder(false);
    }
  };

  const onProjectDrop = (targetSlug: string) => {
    if (!isEditMode || !editorState || activeFilter !== "all" || !draggingProjectSlug) {
      return;
    }

    const nextOrder = reorderByValue(projectOrderDraft, draggingProjectSlug, targetSlug);
    setDraggingProjectSlug(null);

    if (nextOrder === projectOrderDraft) {
      return;
    }

    const previousOrder = projectOrderDraft;
    setProjectOrderDraft(nextOrder);
    void persistProjectOrder(nextOrder, previousOrder);
  };

  const onCategoryDrop = (targetCategory: string) => {
    if (!isEditMode || !editorState || !draggingCategory) {
      return;
    }

    const nextOrder = reorderByValue(categoryOrderDraft, draggingCategory, targetCategory);
    setDraggingCategory(null);

    if (nextOrder === categoryOrderDraft) {
      return;
    }

    const previousOrder = categoryOrderDraft;
    setCategoryOrderDraft(nextOrder);
    void persistCategoryOrder(nextOrder, previousOrder);
  };

  const onAddCategory = async () => {
    if (!isEditMode) {
      return;
    }

    const nextCategory = newCategory.trim();
    if (!nextCategory) {
      return;
    }

    setIsAddingCategory(true);
    setEditorError("");
    setEditorStatus("");

    try {
      const response = await fetch("/api/editor/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: nextCategory,
        }),
      });
      const payload = (await response.json()) as EditorStatePayload;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to add category");
      }

      setEditorState(payload);
      setCategoryOrderDraft(payload.workspace.categories);
      setNewCategory("");
      setShowCategoryCreator(false);
      setEditorStatus("Category added.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add category";
      setEditorError(message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const toggleNewProjectCategory = (category: string) => {
    setNewProjectCategories((current) => {
      const isSelected = current.includes(category);
      if (isSelected) {
        if (current.length <= 1) {
          return current;
        }
        return current.filter((item) => item !== category);
      }
      return [...current, category];
    });
  };

  const createProject = async () => {
    if (!isEditMode || !editorState) {
      return;
    }

    const title = newProjectTitle.trim();
    const slug = normalizeSlug(newProjectSlug);
    const description = newProjectDescription;
    if (!title) {
      setEditorError("Project title is required.");
      return;
    }
    if (!slug) {
      setEditorError("Project slug is required.");
      return;
    }
    if (newProjectCategories.length === 0) {
      setEditorError("Select at least one category.");
      return;
    }

    setIsCreatingProject(true);
    setEditorError("");
    setEditorStatus("");
    setNewProjectLink(null);

    try {
      const response = await fetch("/api/editor/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          categories: newProjectCategories,
        }),
      });
      const payload = (await response.json()) as EditorStatePayload;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create project");
      }

      setEditorState(payload);
      setProjectOrderDraft(payload.workspace.projectOrder);
      setCategoryOrderDraft(payload.workspace.categories);
      setActiveFilter("all");
      setNewProjectTitle("");
      setNewProjectSlug("");
      setNewProjectDescription("");
      setIsProjectSlugDirty(false);
      setNewProjectCategories(payload.workspace.categories.length > 0 ? [payload.workspace.categories[0]] : []);
      setEditorStatus("Project created. Open it to upload photos.");

      if (payload.createdProject) {
        const primaryCategory = payload.createdProject.categories[0];
        if (primaryCategory) {
          setNewProjectLink({
            slug: payload.createdProject.slug,
            category: primaryCategory,
          });
        }
      }

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create project";
      setEditorError(message);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleTitleDraftChange = (value: string) => {
    setNewProjectTitle(value);
    if (!isProjectSlugDirty) {
      setNewProjectSlug(normalizeSlug(value));
    }
  };

  const canReorderProjects = isEditMode && activeFilter === "all" && !isSavingProjectOrder;
  const canReorderCategories = isEditMode && !isSavingCategoryOrder;

  return (
    <section className="page page--wide">
      <header className="works-intro">
        <h1 className="works-intro__title">works</h1>
        {isEditMode ? (
          <div className="works-intro__nav works-intro__nav--edit" role="group" aria-label="work filters">
            <TextActionButton
              className="works-intro__link"
              tone={activeFilter === "all" ? "default" : "muted"}
              underline={activeFilter === "all" ? "underline" : "none"}
              onClick={() => setActiveFilter("all")}
            >
              all
            </TextActionButton>

            {availableCategories.map((category) => {
              const label = categoryLabels[category as ProjectCategory] ?? category;
              return (
                <span
                  key={category}
                  className="works-edit-chip"
                  draggable={canReorderCategories}
                  onDragStart={() => {
                    if (!canReorderCategories) {
                      return;
                    }
                    setDraggingCategory(category);
                  }}
                  onDragOver={(event) => {
                    if (!canReorderCategories || !draggingCategory || draggingCategory === category) {
                      return;
                    }
                    event.preventDefault();
                  }}
                  onDrop={() => onCategoryDrop(category)}
                  onDragEnd={() => setDraggingCategory(null)}
                >
                  <TextActionButton
                    className="works-intro__link"
                    tone={activeFilter === category ? "default" : "muted"}
                    underline={activeFilter === category ? "underline" : "none"}
                    onClick={() => setActiveFilter(category)}
                  >
                    {label}
                  </TextActionButton>
                  <span className="works-edit-chip__drag">::</span>
                </span>
              );
            })}

            <button
              type="button"
              className="works-edit-chip works-edit-chip--add"
              aria-label="Add category"
              onClick={() => setShowCategoryCreator((current) => !current)}
            >
              +
            </button>
          </div>
        ) : (
          <div className="works-intro__nav" role="group" aria-label="work filters">
            {filterOptions.map((option, index) => (
              <Fragment key={option.value}>
                {index > 0 ? <span className="works-intro__separator" aria-hidden="true">-</span> : null}
                <TextActionButton
                  className="works-intro__link"
                  tone={activeFilter === option.value ? "default" : "muted"}
                  underline={activeFilter === option.value ? "underline" : "none"}
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </TextActionButton>
              </Fragment>
            ))}
          </div>
        )}
      </header>

      {isEditMode ? (
        <section className="works-inline-editor" aria-label="Workspace edit status">
          {isEditorLoading ? <p className="project-thumbnails__edit-status">Loading editor data...</p> : null}
          {activeFilter !== "all" ? (
            <p className="project-thumbnails__edit-status">
              Switch filter to all to drag reorder the global project list.
            </p>
          ) : null}
          {editorStatus ? <p className="project-thumbnails__edit-status">{editorStatus}</p> : null}
          {editorError ? <p className="project-thumbnails__edit-error">{editorError}</p> : null}

          {showCategoryCreator ? (
            <div className="project-thumbnails__category-create">
              <input
                className="project-thumbnails__category-input"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="new category"
              />
              <button
                type="button"
                className="project-thumbnails__category-submit"
                disabled={isAddingCategory}
                onClick={() => void onAddCategory()}
              >
                {isAddingCategory ? "adding..." : "add"}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {isEditMode && editorState ? (
        <section className="works-new-project" aria-label="Create new project">
          <header className="works-new-project__header">
            <span className="works-new-project__plus">+</span>
            <h2 className="works-new-project__title">new empty project</h2>
          </header>

          <div className="works-new-project__fields">
            <input
              value={newProjectTitle}
              className="project-thumbnails__category-input"
              placeholder="project title"
              onChange={(event) => handleTitleDraftChange(event.target.value)}
            />
            <input
              value={newProjectSlug}
              className="project-thumbnails__category-input"
              placeholder="project-slug"
              onChange={(event) => {
                setIsProjectSlugDirty(true);
                setNewProjectSlug(event.target.value);
              }}
            />
          </div>

          <textarea
            value={newProjectDescription}
            className="works-new-project__description"
            placeholder="project description"
            onChange={(event) => setNewProjectDescription(event.target.value)}
          />

          <div className="project-thumbnails__category-list">
            {availableCategories.map((category) => {
              const isSelected = newProjectCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  className={`project-category-chip${isSelected ? " project-category-chip--selected" : ""}`}
                  onClick={() => toggleNewProjectCategory(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="works-new-project__actions">
            <button
              type="button"
              className="project-thumbnails__category-submit"
              disabled={isCreatingProject}
              onClick={() => void createProject()}
            >
              {isCreatingProject ? "creating..." : "create project"}
            </button>

            {newProjectLink ? (
              <Link
                href={`/works/${newProjectLink.category}/${newProjectLink.slug}/thumbnails?edit=1`}
                className="text-action text-action--default text-action--underline"
              >
                open new project
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="category-section__rows">
        {filteredProjects.map((project) => (
          <Reveal key={`${activeFilter}-${project.slug}`} rootMargin="0px 0px 220px">
            <ProjectCollageRow
              project={project}
              preferredCategory={activeFilter === "all" ? undefined : (activeFilter as ProjectCategory)}
              editMode={isEditMode}
              reorderEnabled={canReorderProjects}
              onProjectDragStart={(slug) => setDraggingProjectSlug(slug)}
              onProjectDrop={onProjectDrop}
              onProjectDragEnd={() => setDraggingProjectSlug(null)}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
