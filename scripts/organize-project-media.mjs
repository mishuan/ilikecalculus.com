#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_PATH = path.join(ROOT, "src", "data", "site-content.ts");
const MEDIA_ROOT = path.join(ROOT, "public", "media");

function extractSiteDataLiteral(source) {
  const startToken = "export const siteData = ";
  const endToken = "} as const;";
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start);

  if (start < 0 || end < 0) {
    throw new Error("Unable to parse siteData object from site-content.ts");
  }

  return source.slice(start + startToken.length, end + 1);
}

function extensionFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpeg") {
    return ".jpg";
  }
  return ext || ".jpg";
}

function projectMediaPath(slug, fileName) {
  return `/media/projects/${slug}/${fileName}`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const source = await fs.readFile(CONTENT_PATH, "utf8");
  const objectLiteral = extractSiteDataLiteral(source);
  const siteData = Function(`"use strict"; return (${objectLiteral});`)();

  const replacements = new Map();
  const physicalSourceByOriginalSrc = new Map();

  for (const project of siteData.projects) {
    const projectDir = path.join(MEDIA_ROOT, "projects", project.slug);
    await ensureDir(projectDir);

    const seenProjectSrc = new Map();
    const projectImages = project.images;

    for (let index = 0; index < projectImages.length; index += 1) {
      const image = projectImages[index];
      const oldSrc = image.src;
      const srcFileName = path.basename(oldSrc);
      const ext = extensionFor(srcFileName);
      const nextName = `${String(index + 1).padStart(2, "0")}${ext}`;
      const nextSrc = projectMediaPath(project.slug, nextName);
      const destination = path.join(MEDIA_ROOT, "projects", project.slug, nextName);

      if (!seenProjectSrc.has(oldSrc)) {
        seenProjectSrc.set(oldSrc, nextSrc);
      }

      replacements.set(oldSrc, seenProjectSrc.get(oldSrc));

      if (seenProjectSrc.get(oldSrc) !== nextSrc) {
        continue;
      }

      const oldAbsolutePath = path.join(ROOT, "public", oldSrc);
      let sourcePath = oldAbsolutePath;

      if (!(await fileExists(sourcePath))) {
        sourcePath = physicalSourceByOriginalSrc.get(oldSrc) || sourcePath;
      }

      if (!(await fileExists(sourcePath))) {
        throw new Error(`Missing source image for ${oldSrc}`);
      }

      if (!(await fileExists(destination))) {
        await fs.rename(sourcePath, destination);
      } else if (sourcePath !== destination && (await fileExists(sourcePath))) {
        await fs.unlink(sourcePath);
      }

      physicalSourceByOriginalSrc.set(oldSrc, destination);
    }

    const firstImage = project.images[0];
    if (firstImage) {
      const mappedCover = replacements.get(firstImage.src);
      if (mappedCover) {
        replacements.set(project.coverImage.src, mappedCover);
      }
    }
  }

  let nextSource = source;
  for (const [oldSrc, nextSrc] of replacements.entries()) {
    nextSource = nextSource.split(`"${oldSrc}"`).join(`"${nextSrc}"`);
  }

  await fs.writeFile(CONTENT_PATH, nextSource, "utf8");

  console.log(
    JSON.stringify(
      {
        updatedPaths: replacements.size,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
