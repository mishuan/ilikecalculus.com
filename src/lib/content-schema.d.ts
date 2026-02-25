import type {
  ProjectImageManifest,
  ProjectManifest,
  WorkspaceContent,
} from "@/data/content-types";

export function normalizeSlug(rawValue: string): string;
export function normalizeCategory(rawValue: string): string;

export function validateImage(image: unknown, fieldPath: string): asserts image is ProjectImageManifest;
export function validateWorkspace(workspace: unknown): asserts workspace is WorkspaceContent;
export function validateProjectManifest(
  project: unknown,
  workspaceCategories: Set<string> | string[],
): asserts project is ProjectManifest;
export function validateContentBundle(
  workspace: WorkspaceContent,
  projects: ProjectManifest[],
): void;
