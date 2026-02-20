#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const VALID_CATEGORIES = ["portrait", "personal"];

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}

function parseCategories(rawValue) {
  if (!rawValue) {
    return ["personal"];
  }

  const categories = rawValue
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const unique = [...new Set(categories)];
  const invalid = unique.filter((value) => !VALID_CATEGORIES.includes(value));

  if (invalid.length > 0) {
    throw new Error(`Invalid categories: ${invalid.join(", ")}. Use portrait and/or personal.`);
  }

  if (unique.length === 0) {
    return ["personal"];
  }

  return unique;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const slug = (args.slug || "").trim().toLowerCase();
  const title = (args.title || "").trim();
  const description = (args.description || "").trim();
  const categories = parseCategories(args.categories);

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("`--slug` is required and must match [a-z0-9-].");
  }

  if (!title) {
    throw new Error("`--title` is required.");
  }

  const root = process.cwd();
  const mediaDir = path.join(root, "public", "media", "projects", slug);
  const manifestDir = path.join(root, "content", "projects");
  const manifestPath = path.join(manifestDir, `${slug}.json`);

  if (await exists(manifestPath)) {
    throw new Error(`Project manifest already exists: ${manifestPath}`);
  }

  await fs.mkdir(mediaDir, { recursive: true });
  await fs.mkdir(manifestDir, { recursive: true });
  await fs.writeFile(path.join(mediaDir, ".gitkeep"), "", "utf8");

  const manifest = {
    slug,
    title,
    description,
    categories,
    coverImage: {
      src: `/media/projects/${slug}/01.jpg`,
      alt: title,
    },
    images: [
      {
        src: `/media/projects/${slug}/01.jpg`,
        alt: `${title} 01`,
      },
    ],
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Created:\n- ${manifestPath}\n- ${mediaDir}`);
  console.log("\nNext steps:");
  console.log("1) Add your photos to the media folder.");
  console.log("2) Fill width/height metadata in src/data/site-content.ts.");
  console.log("3) Add the project entry in src/data/site-content.ts.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
