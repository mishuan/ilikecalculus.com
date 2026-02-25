"use client";

import { NewProjectPanel } from "@/components/works/new-project-panel";
import { ProjectRowsList } from "@/components/works/project-rows-list";
import { useWorksEditorState } from "@/components/works/use-works-editor-state";
import { WorksFilterBar } from "@/components/works/works-filter-bar";
import { WorksInlineEditor } from "@/components/works/works-inline-editor";

export function WorksIndex() {
  const {
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
  } = useWorksEditorState();

  return (
    <section className="page page--wide">
      <WorksFilterBar
        isEditMode={isEditMode}
        activeFilter={activeFilter}
        availableCategories={availableCategories}
        filterOptions={filterOptions}
        labelForCategory={labelForCategory}
        canReorderCategories={canReorderCategories}
        draggingCategory={draggingCategory}
        onFilterChange={setActiveFilter}
        onCategoryDragStart={setDraggingCategory}
        onCategoryDrop={onCategoryDrop}
        onCategoryDragEnd={() => setDraggingCategory(null)}
        onToggleCategoryCreator={() => setShowCategoryCreator((current) => !current)}
      />

      <WorksInlineEditor
        isEditMode={isEditMode}
        isEditorLoading={isEditorLoading}
        activeFilter={activeFilter}
        editorStatus={editorStatus}
        editorError={editorError}
        showCategoryCreator={showCategoryCreator}
        newCategory={newCategory}
        isAddingCategory={isAddingCategory}
        onNewCategoryChange={setNewCategory}
        onAddCategory={() => void onAddCategory()}
      />

      <NewProjectPanel
        isEditMode={isEditMode}
        canRender={Boolean(editorState)}
        availableCategories={availableCategories}
        newProjectTitle={newProjectTitle}
        newProjectSlug={newProjectSlug}
        newProjectDescription={newProjectDescription}
        newProjectCategories={newProjectCategories}
        isCreatingProject={isCreatingProject}
        newProjectLink={newProjectLink}
        onTitleChange={handleTitleDraftChange}
        onSlugChange={(value) => {
          setIsProjectSlugDirty(true);
          setNewProjectSlug(value);
        }}
        onDescriptionChange={setNewProjectDescription}
        onToggleCategory={toggleNewProjectCategory}
        onCreateProject={() => void createProject()}
      />

      <ProjectRowsList
        projects={filteredProjects}
        rowKeyPrefix={activeFilter}
        editMode={isEditMode}
        reorderEnabled={canReorderProjects}
        preferredCategory={preferredCategory}
        onProjectDragStart={setDraggingProjectSlug}
        onProjectDrop={onProjectDrop}
        onProjectDragEnd={() => setDraggingProjectSlug(null)}
      />
    </section>
  );
}
