import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type {
  ProjectManifest,
  WorkspaceContent,
} from "@/data/content-types";
import {
  validateContentBundle,
  validateProjectManifest,
  validateWorkspace,
} from "@/lib/content-schema";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const WORKSPACE_PATH = path.join(CONTENT_DIR, "workspace.json");
const MEDIA_PROJECTS_ROOT = path.join(ROOT, "public", "media", "projects");
const runExecFile = promisify(execFile);

const writeFileAtomically = async (targetPath: string, value: string) => {
  const temporaryPath = `${targetPath}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, value, "utf8");
  await fs.rename(temporaryPath, targetPath);
};

export { validateWorkspace, validateProjectManifest, validateContentBundle };

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

  return Promise.all(
    files.map(async (fileName) => readJsonFile<ProjectManifest>(path.join(PROJECTS_DIR, fileName))),
  );
}

export async function readProject(slug: string): Promise<ProjectManifest> {
  return readJsonFile<ProjectManifest>(projectManifestPath(slug));
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
