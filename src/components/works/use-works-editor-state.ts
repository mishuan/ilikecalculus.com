"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  categoryLabels,
  categoryOrder,
  isProjectCategory,
  projects,
  type ProjectCategory,
} from "@/data/site-content";
import { useEditMode } from "@/hooks/use-edit-mode";
import {
  createCategory,
  createProject as createEditorProject,
  fetchEditorState,
  reorderCategories,
  reorderProjects,
  type EditorStatePayload,
} from "@/lib/editor-api-client";
import { normalizeSlug } from "@/lib/content-schema";

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

export function useWorksEditorState() {
  const router = useRouter();
  const isEditMode = useEditMode();

  const [activeFilter, setActiveFilter] = useState<string | "all">("all");
  const [editorState, setEditorState] = useState<EditorStatePayload | null>(null);
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
      const payload = await fetchEditorState();
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

  const availableCategories = isEditMode && editorState ? categoryOrderDraft : categoryOrder;

  const labelForCategory = (category: string) =>
    isProjectCategory(category) ? categoryLabels[category] : category;

  const filterOptions: Array<{ value: string | "all"; label: string }> = [
    { value: "all", label: "all" },
    ...availableCategories.map((category) => ({
      value: category,
      label: labelForCategory(category),
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
      const payload = await reorderProjects(nextOrder);

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
      const payload = await reorderCategories(nextOrder);

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
      const payload = await createCategory(nextCategory);

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
      const payload = await createEditorProject({
        title,
        slug,
        description,
        categories: newProjectCategories,
      });

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
  const preferredCategory: ProjectCategory | undefined = isProjectCategory(activeFilter)
    ? activeFilter
    : undefined;

  return {
    isEditMode,
    activeFilter,
    setActiveFilter,
    editorState,
    editorError,
    editorStatus,
    isEditorLoading,
    availableCategories,
    filterOptions,
    labelForCategory,
    filteredProjects,
    canReorderProjects,
    canReorderCategories,
    draggingCategory,
    setDraggingCategory,
    setDraggingProjectSlug,
    onCategoryDrop,
    onProjectDrop,
    showCategoryCreator,
    setShowCategoryCreator,
    newCategory,
    setNewCategory,
    isAddingCategory,
    onAddCategory,
    newProjectTitle,
    newProjectSlug,
    newProjectDescription,
    setNewProjectSlug,
    setNewProjectDescription,
    setIsProjectSlugDirty,
    newProjectCategories,
    isCreatingProject,
    newProjectLink,
    toggleNewProjectCategory,
    createProject,
    handleTitleDraftChange,
    preferredCategory,
  };
}
