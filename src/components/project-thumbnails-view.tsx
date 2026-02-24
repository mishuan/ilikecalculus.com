"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { ProjectCollageGrid } from "@/components/project-collage-grid";
import type { EditorStateResponse } from "@/data/content-types";
import {
  projectHref,
  type Project,
  type ProjectCategory,
} from "@/data/site-content";
import { useEditMode } from "@/hooks/use-edit-mode";

type ProjectThumbnailsViewProps = {
  project: Project;
  activeCategory: ProjectCategory;
  activePhoto?: number;
  nextProject: {
    href: string;
    title: string;
  } | null;
};

function normalizeCategory(rawValue: string) {
  return rawValue.trim().toLowerCase().replace(/\s+/g, "-");
}

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

export function ProjectThumbnailsView({
  project,
  activeCategory,
  activePhoto,
  nextProject,
}: ProjectThumbnailsViewProps) {
  const router = useRouter();
  const isEditMode = useEditMode();

  const [editorState, setEditorState] = useState<EditorStateResponse | null>(null);
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
        const response = await fetch("/api/editor/state", {
          cache: "no-store",
        });
        const payload = (await response.json()) as EditorStateResponse & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load edit state.");
        }

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
      const response = await fetch(`/api/editor/projects/${project.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: nextValues.title.trim(),
          description: nextValues.description,
          categories: nextValues.categories,
        }),
      });

      const payload = (await response.json()) as EditorStateResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save project edits.");
      }

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
      const response = await fetch(`/api/editor/projects/${project.slug}/photos/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderedSrcs: nextOrder,
        }),
      });

      const payload = (await response.json()) as EditorStateResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save photo order.");
      }

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
      const createResponse = await fetch("/api/editor/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: rawCategory }),
      });
      const createPayload = (await createResponse.json()) as EditorStateResponse & { error?: string };
      if (!createResponse.ok) {
        throw new Error(createPayload.error || "Unable to add category.");
      }

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

  const openPhotoPicker = () => {
    uploadInputRef.current?.click();
  };

  const uploadPhoto = async (file: File) => {
    if (!isEditMode) {
      return;
    }

    setIsUploadingPhoto(true);
    setInlineError("");
    setInlineStatus("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", file.name);

      const response = await fetch(`/api/editor/projects/${project.slug}/photos`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as EditorStateResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to add photo.");
      }

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
      const response = await fetch(`/api/editor/projects/${project.slug}/photos/${index}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as EditorStateResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete photo.");
      }

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

  return (
    <section className="page page--wide project-thumbnails">
      <header className="page-header">
        {isEditMode ? (
          <input
            className="page-title page-title--inline-edit"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={handleTitleBlur}
            aria-label="Project title"
          />
        ) : (
          <h1 className="page-title">{orderedProject.title}</h1>
        )}

        {isEditMode ? (
          <textarea
            className="page-intro page-intro--inline-edit"
            value={descriptionDraft}
            onChange={(event) => setDescriptionDraft(event.target.value)}
            onBlur={handleDescriptionBlur}
            aria-label="Project description"
            placeholder={`${orderedProject.images.length} photographs in this collection.`}
          />
        ) : (
          <p className="page-intro">
            {orderedProject.description || `${orderedProject.images.length} photographs in this collection.`}
          </p>
        )}

        {isEditMode ? (
          <div className="project-thumbnails__category-row">
            <div className="project-thumbnails__category-list">
              {availableCategories.map((category) => {
                const isSelected = categoryDraft.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={`project-category-chip${isSelected ? " project-category-chip--selected" : ""}`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                );
              })}
              <button
                type="button"
                className="project-category-chip project-category-chip--add"
                aria-label="Add category"
                onClick={() => setShowCategoryCreator((current) => !current)}
              >
                +
              </button>
            </div>

            {showCategoryCreator ? (
              <div className="project-thumbnails__category-create">
                <input
                  className="project-thumbnails__category-input"
                  value={newCategoryDraft}
                  onChange={(event) => setNewCategoryDraft(event.target.value)}
                  placeholder="new category"
                />
                <button
                  type="button"
                  className="project-thumbnails__category-submit"
                  disabled={isAddingCategory}
                  onClick={() => void addNewCategory()}
                >
                  {isAddingCategory ? "adding..." : "add"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="project-thumbnails__actions">
          <Link
            href={slideshowHref}
            className="text-action text-action--default text-action--underline"
            data-testid="thumbnail-page-slideshow-link"
          >
            slideshow
          </Link>
          {nextProject ? (
            <Link
              href={nextProject.href}
              className="text-action text-action--default text-action--underline"
              data-testid="thumbnail-page-next-project-link"
            >
              next project: {nextProject.title}
            </Link>
          ) : null}
          {isEditMode && (isLoadingEditorState || isSavingInline || isUploadingPhoto || isSavingPhotoOrder) ? (
            <span className="project-thumbnails__edit-status">saving...</span>
          ) : null}
          {isEditMode && inlineStatus ? (
            <span className="project-thumbnails__edit-status">{inlineStatus}</span>
          ) : null}
          {isEditMode && inlineError ? (
            <span className="project-thumbnails__edit-error">{inlineError}</span>
          ) : null}
        </div>
      </header>

      {isEditMode ? (
        <>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="project-thumbnails__upload-input"
            onChange={handleUploadInputChange}
          />
          <button
            type="button"
            className={`project-thumbnails__upload-dropzone${isUploadDragOver ? " project-thumbnails__upload-dropzone--active" : ""}`}
            onClick={openPhotoPicker}
            onDragOver={(event) => {
              event.preventDefault();
              setIsUploadDragOver(true);
            }}
            onDragLeave={() => setIsUploadDragOver(false)}
            onDrop={handleUploadDrop}
            disabled={isUploadingPhoto}
          >
            <span className="project-thumbnails__upload-plus">+</span>
            <span className="project-thumbnails__upload-title">add photo</span>
            <span className="project-thumbnails__upload-hint">click or drag an image file here</span>
          </button>
        </>
      ) : null}

      <ProjectCollageGrid
        project={orderedProject}
        activeCategory={activeCategory}
        editMode={isEditMode}
        deletingPhotoSrc={deletingPhotoSrc}
        isReorderingPhotos={isSavingPhotoOrder}
        onDeletePhoto={(src) => void deletePhoto(src)}
        onReorderPhoto={handleReorderPhoto}
      />
    </section>
  );
}
