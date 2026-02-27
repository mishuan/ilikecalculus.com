type HoverIntentInput = {
  locationId: string;
  hoveredLocationId: string | null;
  onHoverLocation: (id: string | null) => void;
  onActivate?: () => void;
  onClear?: () => void;
  disabled?: boolean;
};

export function createHoverIntent({
  locationId,
  hoveredLocationId,
  onHoverLocation,
  onActivate,
  onClear,
  disabled = false,
}: HoverIntentInput) {
  return {
    activate: () => {
      if (disabled) {
        return;
      }
      onActivate?.();
      onHoverLocation(locationId);
    },
    clear: () => {
      onClear?.();
      if (hoveredLocationId === locationId) {
        onHoverLocation(null);
      }
    },
  };
}
