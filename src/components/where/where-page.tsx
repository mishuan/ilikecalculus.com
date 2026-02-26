"use client";

import { EditorStatus } from "@/components/ui/editor-controls";
import { WhereMap } from "@/components/where/where-map";
import { WhereTimeline } from "@/components/where/where-timeline";
import { useWhereState } from "@/components/where/use-where-state";
import type { WhereLocation } from "@/data/site-content";

type WherePageProps = {
  initialLocations: WhereLocation[];
};

export function WherePage({ initialLocations }: WherePageProps) {
  const {
    isEditMode,
    isLoadingEditorState,
    isCreatingLocation,
    updatingLocationId,
    deletingLocationId,
    status,
    error,
    selectedLocationId,
    setSelectedLocationId,
    hoveredLocationId,
    setHoveredLocationId,
    focusedLocationId,
    currentLocation,
    pastLocations,
    upcomingLocations,
    mapLocations,
    latestPastLocationId,
    createLocation,
    updateLocation,
    deleteLocation,
  } = useWhereState({ initialLocations });

  const isMutating = isCreatingLocation || updatingLocationId !== null || deletingLocationId !== null;

  return (
    <section className="page page--where">
      <header className="page-header">
        <h1 className="page-title">where is michael?</h1>
        <p className="page-intro">
          A running map of where I have been and where I am going next.
        </p>
        {isEditMode && isLoadingEditorState ? <EditorStatus>loading edit state...</EditorStatus> : null}
        {isEditMode && isMutating ? <EditorStatus>saving...</EditorStatus> : null}
        {isEditMode && status ? <EditorStatus tone="success">{status}</EditorStatus> : null}
        {isEditMode && error ? <EditorStatus tone="error">{error}</EditorStatus> : null}
      </header>

      <div className="where-layout">
        <WhereTimeline
          currentLocation={currentLocation}
          pastLocations={pastLocations}
          upcomingLocations={upcomingLocations}
          selectedLocationId={selectedLocationId}
          hoveredLocationId={hoveredLocationId}
          focusedLocationId={focusedLocationId}
          latestPastLocationId={latestPastLocationId}
          isEditMode={isEditMode}
          isLoadingEditorState={isLoadingEditorState}
          isCreatingLocation={isCreatingLocation}
          updatingLocationId={updatingLocationId}
          deletingLocationId={deletingLocationId}
          onSelectLocation={setSelectedLocationId}
          onHoverLocation={setHoveredLocationId}
          onCreateLocation={createLocation}
          onUpdateLocation={updateLocation}
          onDeleteLocation={deleteLocation}
        />

        <WhereMap
          key={selectedLocationId ?? "where-map-default"}
          locations={mapLocations}
          selectedLocationId={selectedLocationId}
          hoveredLocationId={hoveredLocationId}
          focusedLocationId={focusedLocationId}
          latestPastLocationId={latestPastLocationId}
          onSelectLocation={setSelectedLocationId}
          onHoverLocation={setHoveredLocationId}
        />
      </div>
    </section>
  );
}
