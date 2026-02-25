import type {
  EditorStateResponse,
  LocationEntry,
  ProjectImageManifest,
} from "@/data/content-types";

type EditorErrorPayload = {
  error?: string;
};

export type EditorStatePayload = EditorStateResponse &
  EditorErrorPayload & {
    createdProject?: {
      slug: string;
      categories: string[];
    };
    addedImage?: ProjectImageManifest;
    removedImage?: ProjectImageManifest;
    createdLocation?: LocationEntry;
    updatedLocation?: LocationEntry;
    deletedLocationId?: string;
  };

async function requestJson<TPayload extends EditorErrorPayload>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TPayload> {
  const response = await fetch(input, init);
  const payload = (await response.json()) as TPayload;

  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

export async function fetchEditorState() {
  return requestJson<EditorStatePayload>("/api/editor/state", {
    cache: "no-store",
  });
}

export async function createCategory(category: string) {
  return requestJson<EditorStatePayload>("/api/editor/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category }),
  });
}

export async function reorderCategories(categories: string[]) {
  return requestJson<EditorStatePayload>("/api/editor/categories", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ categories }),
  });
}

export async function createProject(payload: {
  title: string;
  slug: string;
  description: string;
  categories: string[];
}) {
  return requestJson<EditorStatePayload>("/api/editor/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function reorderProjects(projectOrder: string[]) {
  return requestJson<EditorStatePayload>("/api/editor/projects/order", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectOrder }),
  });
}

export async function updateProject(
  slug: string,
  payload: {
    title: string;
    description: string;
    categories: string[];
  },
) {
  return requestJson<EditorStatePayload>(`/api/editor/projects/${slug}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function reorderProjectPhotos(slug: string, orderedSrcs: string[]) {
  return requestJson<EditorStatePayload>(`/api/editor/projects/${slug}/photos/order`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderedSrcs }),
  });
}

export async function uploadProjectPhoto(slug: string, file: File, alt: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("alt", alt);

  return requestJson<EditorStatePayload>(`/api/editor/projects/${slug}/photos`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteProjectPhoto(slug: string, index: number) {
  return requestJson<EditorStatePayload>(`/api/editor/projects/${slug}/photos/${index}`, {
    method: "DELETE",
  });
}

export async function createLocation(payload: {
  label: string;
  latitude: number;
  longitude: number;
  at: string;
  note: string;
}) {
  return requestJson<EditorStatePayload>("/api/editor/locations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateLocation(
  id: string,
  payload: {
    label: string;
    latitude: number;
    longitude: number;
    at: string;
    note: string;
  },
) {
  return requestJson<EditorStatePayload>(`/api/editor/locations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteLocation(id: string) {
  return requestJson<EditorStatePayload>(`/api/editor/locations/${id}`, {
    method: "DELETE",
  });
}
