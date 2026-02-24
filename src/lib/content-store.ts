import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type {
  ProjectImageManifest,
  ProjectManifest,
  WorkspaceContent,
} from "@/data/content-types";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const WORKSPACE_PATH = path.join(CONTENT_DIR, "workspace.json");
const MEDIA_PROJECTS_ROOT = path.join(ROOT, "public", "media", "projects");
const writeFileAtomically = async (targetPath: string, value: string) => {
  const temporaryPath = `${targetPath}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, value, "utf8");
  await fs.rename(temporaryPath, targetPath);
};
const runExecFile = promisify(execFile);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNonEmptyString(value: unknown, fieldPath: string): asserts value is string {
  assert(typeof value === "string" && value.trim().length > 0, `${fieldPath} must be a non-empty string`);
}

function assertPositiveInteger(value: unknown, fieldPath: string): asserts value is number {
  assert(Number.isInteger(value) && Number(value) > 0, `${fieldPath} must be a positive integer`);
}

function assertUnique(values: string[], fieldPath: string) {
  assert(new Set(values).size === values.length, `${fieldPath} must not contain duplicates`);
}

function validateImage(image: unknown, fieldPath: string): asserts image is ProjectImageManifest {
  assert(isPlainObject(image), `${fieldPath} must be an object`);
  assertNonEmptyString(image.src, `${fieldPath}.src`);
  assertPositiveInteger(image.width, `${fieldPath}.width`);
  assertPositiveInteger(image.height, `${fieldPath}.height`);
  assertNonEmptyString(image.alt, `${fieldPath}.alt`);
}

export function validateWorkspace(workspace: unknown): asserts workspace is WorkspaceContent {
  assert(isPlainObject(workspace), "workspace must be an object");
  assert(isPlainObject(workspace.site), "workspace.site must be an object");
  assertNonEmptyString(workspace.site.name, "workspace.site.name");
  assertNonEmptyString(workspace.site.shortName, "workspace.site.shortName");
  assertNonEmptyString(workspace.site.tagline, "workspace.site.tagline");
  assertNonEmptyString(workspace.site.instagramUrl, "workspace.site.instagramUrl");
  assertNonEmptyString(workspace.site.blogUrl, "workspace.site.blogUrl");

  assert(isPlainObject(workspace.about), "workspace.about must be an object");
  assertNonEmptyString(workspace.about.title, "workspace.about.title");
  assert(Array.isArray(workspace.about.paragraphs), "workspace.about.paragraphs must be an array");
  workspace.about.paragraphs.forEach((paragraph, index) =>
    assertNonEmptyString(paragraph, `workspace.about.paragraphs[${index}]`),
  );
  validateImage(workspace.about.image, "workspace.about.image");

  assert(isPlainObject(workspace.contact), "workspace.contact must be an object");
  assertNonEmptyString(workspace.contact.title, "workspace.contact.title");
  assert(Array.isArray(workspace.contact.paragraphs), "workspace.contact.paragraphs must be an array");
  workspace.contact.paragraphs.forEach((paragraph, index) =>
    assertNonEmptyString(paragraph, `workspace.contact.paragraphs[${index}]`),
  );
  validateImage(workspace.contact.image, "workspace.contact.image");

  assert(Array.isArray(workspace.press), "workspace.press must be an array");
  workspace.press.forEach((item, index) => {
    assert(isPlainObject(item), `workspace.press[${index}] must be an object`);
    assertNonEmptyString(item.outlet, `workspace.press[${index}].outlet`);
    assertNonEmptyString(item.title, `workspace.press[${index}].title`);
    assertNonEmptyString(item.url, `workspace.press[${index}].url`);
  });

  assert(Array.isArray(workspace.categories), "workspace.categories must be an array");
  workspace.categories.forEach((category, index) =>
    assertNonEmptyString(category, `workspace.categories[${index}]`),
  );
  assert(workspace.categories.length > 0, "workspace.categories must include at least one category");
  assertUnique(workspace.categories, "workspace.categories");

  assert(Array.isArray(workspace.projectOrder), "workspace.projectOrder must be an array");
  workspace.projectOrder.forEach((slug, index) =>
    assertNonEmptyString(slug, `workspace.projectOrder[${index}]`),
  );
  assertUnique(workspace.projectOrder, "workspace.projectOrder");

  assert(
    Array.isArray(workspace.featuredProjectSlugs),
    "workspace.featuredProjectSlugs must be an array",
  );
  workspace.featuredProjectSlugs.forEach((slug, index) =>
    assertNonEmptyString(slug, `workspace.featuredProjectSlugs[${index}]`),
  );
  assertUnique(workspace.featuredProjectSlugs, "workspace.featuredProjectSlugs");
}

export function validateProjectManifest(
  project: unknown,
  workspaceCategories: Set<string>,
): asserts project is ProjectManifest {
  assert(isPlainObject(project), "project must be an object");
  assertNonEmptyString(project.slug, "project.slug");
  assertNonEmptyString(project.title, "project.title");
  assert(typeof project.description === "string", "project.description must be a string");

  assert(Array.isArray(project.categories), "project.categories must be an array");
  assert(project.categories.length > 0, "project.categories must include at least one category");
  project.categories.forEach((category, index) => {
    assertNonEmptyString(category, `project.categories[${index}]`);
    assert(workspaceCategories.has(category), `project.categories[${index}] must exist in workspace.categories`);
  });
  assertUnique(project.categories, "project.categories");

  assert(Array.isArray(project.images), "project.images must be an array");

  const seenSrc = new Set<string>();
  project.images.forEach((image, index) => {
    validateImage(image, `project.images[${index}]`);
    assert(
      image.src.startsWith(`/media/projects/${project.slug}/`),
      `project.images[${index}].src must live under /media/projects/${project.slug}/`,
    );
    assert(!seenSrc.has(image.src), `project.images has duplicate src: ${image.src}`);
    seenSrc.add(image.src);
  });

  const coverImage = project.coverImage;
  assert(coverImage === null || isPlainObject(coverImage), "project.coverImage must be an object or null");

  if (coverImage) {
    validateImage(coverImage, "project.coverImage");
    assert(
      coverImage.src.startsWith(`/media/projects/${project.slug}/`),
      "project.coverImage.src must live under /media/projects/<slug>/",
    );
    assert(
      project.images.some((image) => image.src === coverImage.src),
      "project.coverImage.src must reference an image in project.images",
    );
  } else {
    assert(
      project.images.length === 0,
      "project.coverImage can be null only when project.images is empty",
    );
  }
}

export function validateContentBundle(workspace: WorkspaceContent, projects: ProjectManifest[]) {
  validateWorkspace(workspace);
  const categorySet = new Set(workspace.categories);

  const projectBySlug = new Map<string, ProjectManifest>();
  for (const project of projects) {
    validateProjectManifest(project, categorySet);
    assert(
      !projectBySlug.has(project.slug),
      `Duplicate project slug found while validating content: ${project.slug}`,
    );
    projectBySlug.set(project.slug, project);
  }

  assert(
    workspace.projectOrder.length === projects.length,
    "workspace.projectOrder length must exactly match the number of projects",
  );
  for (const slug of workspace.projectOrder) {
    assert(projectBySlug.has(slug), `workspace.projectOrder contains unknown project slug: ${slug}`);
  }
  for (const project of projects) {
    assert(workspace.projectOrder.includes(project.slug), `workspace.projectOrder is missing ${project.slug}`);
  }
  for (const slug of workspace.featuredProjectSlugs) {
    assert(projectBySlug.has(slug), `workspace.featuredProjectSlugs contains unknown slug: ${slug}`);
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function readWorkspace(): Promise<WorkspaceContent> {
  const workspace = await readJsonFile<WorkspaceContent>(WORKSPACE_PATH);
  validateWorkspace(workspace);
  return workspace;
}

export async function readAllProjects(): Promise<ProjectManifest[]> {
  const files = (await fs.readdir(PROJECTS_DIR))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const projects = await Promise.all(
    files.map(async (fileName) => readJsonFile<ProjectManifest>(path.join(PROJECTS_DIR, fileName))),
  );

  return projects;
}

export async function readProject(slug: string): Promise<ProjectManifest> {
  const project = await readJsonFile<ProjectManifest>(projectManifestPath(slug));
  return project;
}

export async function readContentBundle() {
  const workspace = await readWorkspace();
  const projects = await readAllProjects();
  validateContentBundle(workspace, projects);
  return { workspace, projects };
}

export function projectManifestPath(slug: string) {
  return path.join(PROJECTS_DIR, `${slug}.json`);
}

export function projectMediaDirectory(slug: string) {
  return path.join(MEDIA_PROJECTS_ROOT, slug);
}

export function mediaAbsolutePathFromSrc(src: string) {
  const normalized = src.startsWith("/") ? src.slice(1) : src;
  return path.join(ROOT, "public", normalized);
}

export async function writeWorkspace(workspace: WorkspaceContent) {
  validateWorkspace(workspace);
  await writeFileAtomically(WORKSPACE_PATH, `${JSON.stringify(workspace, null, 2)}\n`);
}

export async function writeProject(project: ProjectManifest, workspaceCategories: string[]) {
  validateProjectManifest(project, new Set(workspaceCategories));
  await writeFileAtomically(projectManifestPath(project.slug), `${JSON.stringify(project, null, 2)}\n`);
}

export async function rebuildGeneratedSiteData() {
  try {
    await runExecFile("node", ["scripts/build-site-data.mjs"], {
      cwd: ROOT,
      env: process.env,
    });
  } catch (error) {
    const details = error as { stderr?: string; message?: string };
    throw new Error(details.stderr?.trim() || details.message || "Failed to rebuild generated site data");
  }
}
