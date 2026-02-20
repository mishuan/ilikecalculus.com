import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = process.cwd();
const MEDIA_DIR = path.join(PROJECT_ROOT, "public", "media");
const CONTENT_PATH = path.join(PROJECT_ROOT, "src", "data", "site-content.ts");
const TARGET_BYTES = 500 * 1024;

const SCALE_STEPS = [1, 0.9, 0.8, 0.72, 0.64, 0.56, 0.5];
const QUALITY_STEPS = [82, 76, 70, 64, 58, 52, 46, 40, 34];

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

async function updateContentDimensions(dimensionsBySrc) {
  let content = await fs.readFile(CONTENT_PATH, "utf8");

  content = content.replace(
    /("src":\s*"([^"]+)",\s*"width":\s*)(\d+)(,\s*"height":\s*)(\d+)/g,
    (full, prefix, src, width, middle, height) => {
      const dims = dimensionsBySrc.get(src);
      if (!dims) {
        return full;
      }
      return `${prefix}${dims.width}${middle}${dims.height}`;
    },
  );

  await fs.writeFile(CONTENT_PATH, content, "utf8");
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
