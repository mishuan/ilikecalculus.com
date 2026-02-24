#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_PROJECTS_DIR = path.join(ROOT, "content", "projects");
const MEDIA_ROOT = path.join(ROOT, "public", "media", "projects");

function extensionFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpeg") {
    return ".jpg";
  }
  return extension || ".jpg";
}

function mediaSrc(slug, fileName) {
  return `/media/projects/${slug}/${fileName}`;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readProjectManifests() {
  const files = (await fs.readdir(CONTENT_PROJECTS_DIR))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const projects = [];
  for (const fileName of files) {
    const filePath = path.join(CONTENT_PROJECTS_DIR, fileName);
    const project = JSON.parse(await fs.readFile(filePath, "utf8"));
    projects.push({ filePath, project });
  }

  return projects;
}

async function moveWithTemporaryPath(sourcePath, destinationPath) {
  if (sourcePath === destinationPath) {
    return;
  }

  const temporaryPath = `${destinationPath}.${Date.now()}.tmp`;
  await fs.rename(sourcePath, temporaryPath);
  await fs.rename(temporaryPath, destinationPath);
}

async function run() {
  const manifests = await readProjectManifests();
  let updatedProjects = 0;

  for (const entry of manifests) {
    const { filePath, project } = entry;
    const projectDir = path.join(MEDIA_ROOT, project.slug);
    await fs.mkdir(projectDir, { recursive: true });

    const srcMapping = new Map();
    const imagePlan = project.images.map((image, index) => {
      const extension = extensionFor(image.src);
      const nextFileName = `${String(index + 1).padStart(2, "0")}${extension}`;
      const nextSrc = mediaSrc(project.slug, nextFileName);
      const currentAbsolutePath = path.join(ROOT, "public", image.src);
      const nextAbsolutePath = path.join(ROOT, "public", nextSrc);

      if (!srcMapping.has(image.src)) {
        srcMapping.set(image.src, nextSrc);
      }

      return {
        currentAbsolutePath,
        nextAbsolutePath,
        currentSrc: image.src,
        nextSrc,
      };
    });

    const stageMoves = [];
    for (const plan of imagePlan) {
      if (plan.currentAbsolutePath === plan.nextAbsolutePath) {
        continue;
      }
      if (!(await exists(plan.currentAbsolutePath))) {
        throw new Error(`Missing source image for ${project.slug}: ${plan.currentSrc}`);
      }
      stageMoves.push(plan);
    }

    // Stage files out of the way first to avoid name collisions during rename.
    const staged = [];
    for (const plan of stageMoves) {
      const temporaryPath = `${plan.currentAbsolutePath}.staged.${Date.now()}`;
      await fs.rename(plan.currentAbsolutePath, temporaryPath);
      staged.push({ ...plan, temporaryPath });
    }

    for (const plan of staged) {
      await moveWithTemporaryPath(plan.temporaryPath, plan.nextAbsolutePath);
    }

    const nextImages = project.images.map((image) => ({
      ...image,
      src: srcMapping.get(image.src) || image.src,
    }));
    const nextCoverImage = project.coverImage
      ? {
          ...project.coverImage,
          src: srcMapping.get(project.coverImage.src) || project.coverImage.src,
        }
      : null;

    const nextProject = {
      ...project,
      images: nextImages,
      coverImage: nextCoverImage,
    };

    await fs.writeFile(filePath, `${JSON.stringify(nextProject, null, 2)}\n`, "utf8");
    updatedProjects += 1;
  }

  console.log(
    JSON.stringify(
      {
        projectsUpdated: updatedProjects,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
