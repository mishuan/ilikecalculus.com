#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

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

function parseCategories(rawValue, validCategories) {
  if (!rawValue) {
    return [validCategories[0]];
  }

  const categories = rawValue
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const unique = [...new Set(categories)];
  const invalid = unique.filter((value) => !validCategories.includes(value));

  if (invalid.length > 0) {
    throw new Error(
      `Invalid categories: ${invalid.join(", ")}. Use one or more of: ${validCategories.join(", ")}.`,
    );
  }

  if (unique.length === 0) {
    return [validCategories[0]];
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

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("`--slug` is required and must match [a-z0-9-].");
  }

  if (!title) {
    throw new Error("`--title` is required.");
  }

  const root = process.cwd();
  const workspacePath = path.join(root, "content", "workspace.json");
  const workspace = JSON.parse(await fs.readFile(workspacePath, "utf8"));
  const validCategories = workspace.categories;
  if (!Array.isArray(validCategories) || validCategories.length === 0) {
    throw new Error("workspace.json must define at least one category before creating projects.");
  }

  const categories = parseCategories(args.categories, validCategories);
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
    coverImage: null,
    images: [],
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  workspace.projectOrder = [...workspace.projectOrder, slug];
  await fs.writeFile(workspacePath, `${JSON.stringify(workspace, null, 2)}\n`, "utf8");

  console.log(`Created:\n- ${manifestPath}\n- ${mediaDir}\n- ${workspacePath} (updated projectOrder)`);
  console.log("\nNext steps:");
  console.log("1) Add photos in dev edit mode on the project thumbnails page.");
  console.log("2) Run `npm run media:compress` to keep photos under 500 KB and update dimensions.");
  console.log("3) Run `npm run content:build` to regenerate src/data/generated-site-data.ts.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
