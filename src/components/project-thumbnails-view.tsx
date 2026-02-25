"use client";

import { ProjectCollageGrid } from "@/components/project-collage-grid";
import { ProjectActions } from "@/components/project-editor/project-actions";
import { ProjectCategoryEditor } from "@/components/project-editor/project-category-editor";
import { ProjectMetaEditor } from "@/components/project-editor/project-meta-editor";
import { ProjectPhotoUploader } from "@/components/project-editor/project-photo-uploader";
import { useProjectEditorState } from "@/components/project-editor/use-project-editor-state";
import type { Project, ProjectCategory } from "@/data/site-content";

type ProjectThumbnailsViewProps = {
  project: Project;
  activeCategory: ProjectCategory;
  activePhoto?: number;
  nextProject: {
    href: string;
    title: string;
  } | null;
};

export function ProjectThumbnailsView({
  project,
  activeCategory,
  activePhoto,
  nextProject,
}: ProjectThumbnailsViewProps) {
  const {
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
    openPhotoPicker,
    handleReorderPhoto,
    deletePhoto,
  } = useProjectEditorState({
    project,
    activeCategory,
    activePhoto,
  });

  const fallbackDescription = `${orderedProject.images.length} photographs in this collection.`;

  return (
    <section className="page page--wide project-thumbnails">
      <header className="page-header">
        <ProjectMetaEditor
          isEditMode={isEditMode}
          title={isEditMode ? titleDraft : orderedProject.title}
          description={isEditMode ? descriptionDraft : orderedProject.description}
          fallbackDescription={fallbackDescription}
          onTitleChange={setTitleDraft}
          onDescriptionChange={setDescriptionDraft}
          onTitleBlur={handleTitleBlur}
          onDescriptionBlur={handleDescriptionBlur}
        />

        <ProjectCategoryEditor
          isEditMode={isEditMode}
          availableCategories={availableCategories}
          selectedCategories={categoryDraft}
          showCategoryCreator={showCategoryCreator}
          newCategoryDraft={newCategoryDraft}
          isAddingCategory={isAddingCategory}
          onToggleCategory={toggleCategory}
          onToggleCategoryCreator={() => setShowCategoryCreator((current) => !current)}
          onNewCategoryDraftChange={setNewCategoryDraft}
          onAddCategory={() => void addNewCategory()}
        />

        <ProjectActions
          slideshowHref={slideshowHref}
          nextProject={nextProject}
          isEditMode={isEditMode}
          isLoadingEditorState={isLoadingEditorState}
          isSavingInline={isSavingInline}
          isUploadingPhoto={isUploadingPhoto}
          isSavingPhotoOrder={isSavingPhotoOrder}
          inlineStatus={inlineStatus}
          inlineError={inlineError}
        />
      </header>

      <ProjectPhotoUploader
        isEditMode={isEditMode}
        uploadInputRef={uploadInputRef}
        isUploadingPhoto={isUploadingPhoto}
        isUploadDragOver={isUploadDragOver}
        onUploadInputChange={handleUploadInputChange}
        onUploadDrop={handleUploadDrop}
        onUploadDragOver={(event) => {
          event.preventDefault();
          setIsUploadDragOver(true);
        }}
        onUploadDragLeave={() => setIsUploadDragOver(false)}
        onOpenPhotoPicker={openPhotoPicker}
      />

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
