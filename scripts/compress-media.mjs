#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const PROJECT_ROOT = process.cwd();
const MEDIA_DIR = path.join(PROJECT_ROOT, "public", "media");
const CONTENT_DIR = path.join(PROJECT_ROOT, "content");
const CONTENT_PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const WORKSPACE_PATH = path.join(CONTENT_DIR, "workspace.json");
const TARGET_BYTES = 500 * 1024;

const SCALE_STEPS = [1, 0.9, 0.8, 0.72, 0.64, 0.56, 0.5];
const QUALITY_STEPS = [82, 76, 70, 64, 58, 52, 46, 40, 34];
const runExecFile = promisify(execFile);

function roundDimension(value) {
  return Math.max(1, Math.round(value));
}

function mediaSrcFromRelativePath(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  return `/media/${normalized}`;
}

async function optimizeImage(relativePath) {
  const filePath = path.join(MEDIA_DIR, relativePath);
  const originalBuffer = await fs.readFile(filePath);
  const image = sharp(originalBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read dimensions for ${relativePath}`);
  }

  const originalSize = originalBuffer.length;
  const width = metadata.width;
  const height = metadata.height;

  if (originalSize <= TARGET_BYTES) {
    return {
      relativePath,
      changed: false,
      beforeBytes: originalSize,
      afterBytes: originalSize,
      width,
      height,
    };
  }

  let bestResult = null;

  for (const scale of SCALE_STEPS) {
    const nextWidth = roundDimension(width * scale);
    const nextHeight = roundDimension(height * scale);

    for (const quality of QUALITY_STEPS) {
      const output = await sharp(originalBuffer)
        .resize({
          width: nextWidth,
          height: nextHeight,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality,
          mozjpeg: true,
          chromaSubsampling: "4:2:0",
          progressive: true,
        })
        .toBuffer({ resolveWithObject: true });

      const candidate = {
        bytes: output.data.length,
        width: output.info.width,
        height: output.info.height,
        buffer: output.data,
      };

      if (!bestResult || candidate.bytes < bestResult.bytes) {
        bestResult = candidate;
      }

      if (candidate.bytes <= TARGET_BYTES) {
        await fs.writeFile(filePath, candidate.buffer);
        return {
          relativePath,
          changed: true,
          beforeBytes: originalSize,
          afterBytes: candidate.bytes,
          width: candidate.width,
          height: candidate.height,
        };
      }
    }
  }

  if (bestResult && bestResult.bytes < originalSize) {
    await fs.writeFile(filePath, bestResult.buffer);
    return {
      relativePath,
      changed: true,
      beforeBytes: originalSize,
      afterBytes: bestResult.bytes,
      width: bestResult.width,
      height: bestResult.height,
      overTarget: bestResult.bytes > TARGET_BYTES,
    };
  }

  return {
    relativePath,
    changed: false,
    beforeBytes: originalSize,
    afterBytes: originalSize,
    width,
    height,
    overTarget: originalSize > TARGET_BYTES,
  };
}

async function collectMediaFiles(directory, relativeBase = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const output = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeBase, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nested = await collectMediaFiles(absolutePath, relativePath);
      output.push(...nested);
      continue;
    }

    if (entry.isFile() && /\.(jpg|jpeg)$/i.test(entry.name)) {
      output.push(relativePath);
    }
  }

  return output;
}

function applyDimensions(image, dimensionsBySrc) {
  if (!image) {
    return image;
  }
  const dimensions = dimensionsBySrc.get(image.src);
  if (!dimensions) {
    return image;
  }
  return {
    ...image,
    width: dimensions.width,
    height: dimensions.height,
  };
}

async function updateContentDimensions(dimensionsBySrc) {
  const workspace = JSON.parse(await fs.readFile(WORKSPACE_PATH, "utf8"));
  workspace.about.image = applyDimensions(workspace.about.image, dimensionsBySrc);
  workspace.contact.image = applyDimensions(workspace.contact.image, dimensionsBySrc);
  await fs.writeFile(WORKSPACE_PATH, `${JSON.stringify(workspace, null, 2)}\n`, "utf8");

  const projectFiles = (await fs.readdir(CONTENT_PROJECTS_DIR))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  for (const fileName of projectFiles) {
    const filePath = path.join(CONTENT_PROJECTS_DIR, fileName);
    const project = JSON.parse(await fs.readFile(filePath, "utf8"));

    project.coverImage = applyDimensions(project.coverImage, dimensionsBySrc);
    project.images = project.images.map((image) => applyDimensions(image, dimensionsBySrc));

    await fs.writeFile(filePath, `${JSON.stringify(project, null, 2)}\n`, "utf8");
  }
}

async function rebuildGeneratedData() {
  await runExecFile("node", ["scripts/build-site-data.mjs"], {
    cwd: PROJECT_ROOT,
    env: process.env,
  });
}

async function run() {
  const files = await collectMediaFiles(MEDIA_DIR);

  const dimensionsBySrc = new Map();
  const results = [];

  for (const relativePath of files) {
    const result = await optimizeImage(relativePath);
    results.push(result);
    dimensionsBySrc.set(mediaSrcFromRelativePath(relativePath), {
      width: result.width,
      height: result.height,
    });
  }

  await updateContentDimensions(dimensionsBySrc);
  await rebuildGeneratedData();

  const beforeBytes = results.reduce((sum, item) => sum + item.beforeBytes, 0);
  const afterBytes = results.reduce((sum, item) => sum + item.afterBytes, 0);
  const changedCount = results.filter((item) => item.changed).length;
  const overTargetCount = results.filter((item) => item.afterBytes > TARGET_BYTES).length;

  console.log(
    JSON.stringify(
      {
        files: results.length,
        changed: changedCount,
        overTarget: overTargetCount,
        beforeMB: Number((beforeBytes / 1024 / 1024).toFixed(2)),
        afterMB: Number((afterBytes / 1024 / 1024).toFixed(2)),
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
