"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { Project, ProjectCategory } from "@/data/site-content";
import { projectHref } from "@/data/site-content";
import { useEditMode } from "@/hooks/use-edit-mode";
import {
  createCategory,
  deleteProjectPhoto,
  fetchEditorState,
  reorderProjectPhotos,
  updateProject,
  uploadProjectPhoto,
  type EditorStatePayload,
} from "@/lib/editor-api-client";
import { normalizeCategory } from "@/lib/content-schema";

function reorderBySrc(values: string[], draggingSrc: string, targetSrc: string) {
  const startIndex = values.indexOf(draggingSrc);
  const targetIndex = values.indexOf(targetSrc);
  if (startIndex < 0 || targetIndex < 0 || startIndex === targetIndex) {
    return values;
  }

  const next = [...values];
  const [draggingItem] = next.splice(startIndex, 1);
  next.splice(targetIndex, 0, draggingItem);
  return next;
}

type UseProjectEditorStateInput = {
  project: Project;
  activeCategory: ProjectCategory;
  activePhoto?: number;
};

export function useProjectEditorState({
  project,
  activeCategory,
  activePhoto,
}: UseProjectEditorStateInput) {
  const router = useRouter();
  const isEditMode = useEditMode();

  const [editorState, setEditorState] = useState<EditorStatePayload | null>(null);
  const [isLoadingEditorState, setIsLoadingEditorState] = useState(false);
  const [isSavingInline, setIsSavingInline] = useState(false);
  const [isSavingPhotoOrder, setIsSavingPhotoOrder] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadDragOver, setIsUploadDragOver] = useState(false);
  const [deletingPhotoSrc, setDeletingPhotoSrc] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState("");
  const [inlineStatus, setInlineStatus] = useState("");

  const [titleDraft, setTitleDraft] = useState(project.title);
  const [descriptionDraft, setDescriptionDraft] = useState(project.description);
  const [categoryDraft, setCategoryDraft] = useState<string[]>(project.categories);
  const [photoOrderDraft, setPhotoOrderDraft] = useState<string[]>(project.images.map((image) => image.src));
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCategoryDraft, setNewCategoryDraft] = useState("");

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const projectFromEditor = useMemo(
    () => editorState?.projects.find((item) => item.slug === project.slug) ?? null,
    [editorState, project.slug],
  );

  const resolvedProject = projectFromEditor ?? project;
  const availableCategories = editorState?.workspace.categories ?? project.categories;

  useEffect(() => {
    setTitleDraft(resolvedProject.title);
    setDescriptionDraft(resolvedProject.description);
    setCategoryDraft(resolvedProject.categories);
    setPhotoOrderDraft(resolvedProject.images.map((image) => image.src));
  }, [resolvedProject]);

  const orderedProject = useMemo(() => {
    const imageBySrc = new Map(resolvedProject.images.map((image) => [image.src, image]));
    const orderedImages = photoOrderDraft
      .map((src) => imageBySrc.get(src))
      .filter((image): image is NonNullable<typeof image> => Boolean(image));

    if (orderedImages.length !== resolvedProject.images.length) {
      return resolvedProject;
    }

    return {
      ...resolvedProject,
      images: orderedImages,
    };
  }, [photoOrderDraft, resolvedProject]);

  const isPhotoOrderDirty = useMemo(() => {
    if (photoOrderDraft.length !== resolvedProject.images.length) {
      return true;
    }

    return resolvedProject.images.some((image, index) => image.src !== photoOrderDraft[index]);
  }, [photoOrderDraft, resolvedProject.images]);

  const slideshowHref = activePhoto
    ? `${projectHref(orderedProject, activeCategory)}?photo=${activePhoto}`
    : projectHref(orderedProject, activeCategory);

  useEffect(() => {
    if (!isEditMode) {
      setEditorState(null);
      setInlineError("");
      setInlineStatus("");
      return;
    }

    let isCancelled = false;
    const run = async () => {
      setIsLoadingEditorState(true);
      setInlineError("");

      try {
        const payload = await fetchEditorState();
        if (!isCancelled) {
          setEditorState(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Unable to load edit state.";
          setInlineError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingEditorState(false);
        }
      }
    };

    void run();
    return () => {
      isCancelled = true;
    };
  }, [isEditMode]);

  const saveInlineProject = async (nextValues: {
    title: string;
    description: string;
    categories: string[];
  }) => {
    if (!isEditMode) {
      return;
    }

    if (!nextValues.title.trim()) {
      setInlineError("Title cannot be empty.");
      setTitleDraft(resolvedProject.title);
      return;
    }

    if (nextValues.categories.length === 0) {
      setInlineError("Select at least one category.");
      setCategoryDraft(resolvedProject.categories);
      return;
    }

    setIsSavingInline(true);
    setInlineError("");
    setInlineStatus("");

    try {
      const payload = await updateProject(project.slug, {
        title: nextValues.title.trim(),
        description: nextValues.description,
        categories: nextValues.categories,
      });

      setEditorState(payload);
      setInlineStatus("Saved.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save project edits.";
      setInlineError(message);
    } finally {
      setIsSavingInline(false);
    }
  };

  const savePhotoOrder = async (nextOrder: string[], fallbackOrder: string[]) => {
    if (!isEditMode) {
      return;
    }

    setIsSavingPhotoOrder(true);
    setInlineError("");
    setInlineStatus("");

    try {
      const payload = await reorderProjectPhotos(project.slug, nextOrder);

      setEditorState(payload);
      setInlineStatus("Photo order saved.");
      router.refresh();
    } catch (error) {
      setPhotoOrderDraft(fallbackOrder);
      const message = error instanceof Error ? error.message : "Unable to save photo order.";
      setInlineError(message);
    } finally {
      setIsSavingPhotoOrder(false);
    }
  };

  const handleReorderPhoto = (draggingSrc: string, targetSrc: string) => {
    if (!isEditMode || isSavingPhotoOrder) {
      return;
    }

    const nextOrder = reorderBySrc(photoOrderDraft, draggingSrc, targetSrc);
    if (nextOrder === photoOrderDraft) {
      return;
    }

    const previousOrder = photoOrderDraft;
    setPhotoOrderDraft(nextOrder);
    void savePhotoOrder(nextOrder, previousOrder);
  };

  const handleTitleBlur = () => {
    if (!isEditMode || titleDraft === resolvedProject.title) {
      return;
    }

    void saveInlineProject({
      title: titleDraft,
      description: descriptionDraft,
      categories: categoryDraft,
    });
  };

  const handleDescriptionBlur = () => {
    if (!isEditMode || descriptionDraft === resolvedProject.description) {
      return;
    }

    void saveInlineProject({
      title: titleDraft,
      description: descriptionDraft,
      categories: categoryDraft,
    });
  };

  const toggleCategory = (category: string) => {
    if (!isEditMode) {
      return;
    }

    const isSelected = categoryDraft.includes(category);
    const nextCategories = isSelected
      ? categoryDraft.filter((value) => value !== category)
      : [...categoryDraft, category];

    if (nextCategories.length === 0) {
      setInlineError("Project must keep at least one category.");
      return;
    }

    setCategoryDraft(nextCategories);
    void saveInlineProject({
      title: titleDraft,
      description: descriptionDraft,
      categories: nextCategories,
    });
  };

  const addNewCategory = async () => {
    if (!isEditMode) {
      return;
    }

    const rawCategory = newCategoryDraft.trim();
    if (!rawCategory) {
      return;
    }

    setIsAddingCategory(true);
    setInlineError("");
    setInlineStatus("");

    try {
      const createPayload = await createCategory(rawCategory);

      setEditorState(createPayload);
      const normalizedCategory = normalizeCategory(rawCategory);
      const nextCategories = categoryDraft.includes(normalizedCategory)
        ? categoryDraft
        : [...categoryDraft, normalizedCategory];

      setCategoryDraft(nextCategories);
      setNewCategoryDraft("");
      setShowCategoryCreator(false);

      await saveInlineProject({
        title: titleDraft,
        description: descriptionDraft,
        categories: nextCategories,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add category.";
      setInlineError(message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!isEditMode) {
      return;
    }

    setIsUploadingPhoto(true);
    setInlineError("");
    setInlineStatus("");

    try {
      const payload = await uploadProjectPhoto(project.slug, file, file.name);

      setEditorState(payload);
      setInlineStatus("Photo added.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add photo.";
      setInlineError(message);
    } finally {
      setIsUploadingPhoto(false);
      setIsUploadDragOver(false);
    }
  };

  const handleUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    void uploadPhoto(file);
  };

  const handleUploadDrop = (event: DragEvent<HTMLButtonElement>) => {
    if (!isEditMode) {
      return;
    }

    event.preventDefault();
    setIsUploadDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) {
      return;
    }

    const imageFile = files.find((file) => file.type.startsWith("image/")) ?? files[0];
    void uploadPhoto(imageFile);
  };

  const deletePhoto = async (src: string) => {
    if (!isEditMode) {
      return;
    }

    if (isSavingPhotoOrder || isPhotoOrderDirty) {
      setInlineError("Wait for photo reordering to finish before deleting.");
      return;
    }

    const index = resolvedProject.images.findIndex((image) => image.src === src);
    if (index < 0) {
      setInlineError("Unable to locate photo in the current project order.");
      return;
    }

    const confirmed = window.confirm("Delete this photo permanently?");
    if (!confirmed) {
      return;
    }

    setDeletingPhotoSrc(src);
    setInlineError("");
    setInlineStatus("");

    try {
      const payload = await deleteProjectPhoto(project.slug, index);

      setEditorState(payload);
      setInlineStatus("Photo deleted.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete photo.";
      setInlineError(message);
    } finally {
      setDeletingPhotoSrc(null);
    }
  };

  return {
    isEditMode,
    orderedProject,
    availableCategories,
    titleDraft,
    setTitleDraft,
    descriptionDraft,
    setDescriptionDraft,
    categoryDraft,
    showCategoryCreator,
    setShowCategoryCreator,
    newCategoryDraft,
    setNewCategoryDraft,
    isAddingCategory,
    isLoadingEditorState,
    isSavingInline,
    isUploadingPhoto,
    isSavingPhotoOrder,
    isUploadDragOver,
    setIsUploadDragOver,
    deletingPhotoSrc,
    inlineError,
    inlineStatus,
    slideshowHref,
    uploadInputRef,
    handleTitleBlur,
    handleDescriptionBlur,
    toggleCategory,
    addNewCategory,
    handleUploadInputChange,
    handleUploadDrop,
    openPhotoPicker: () => uploadInputRef.current?.click(),
    handleReorderPhoto,
    deletePhoto,
  };
}
