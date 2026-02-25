#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIRECTORIES = [
  path.join(ROOT, "src", "components"),
  path.join(ROOT, "src", "app"),
];

const FILE_PATTERN = /\.(tsx|ts)$/;
const RAW_TEXT_ACTION_PATTERN = /className\s*=\s*"[^"\n]*\btext-action\b[^"\n]*"/;

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }

    if (entry.isFile() && FILE_PATTERN.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function run() {
  const files = (
    await Promise.all(DIRECTORIES.map((directory) => collectFiles(directory)))
  ).flat();

  const violations = [];

  for (const filePath of files) {
    const source = await fs.readFile(filePath, "utf8");
    if (!RAW_TEXT_ACTION_PATTERN.test(source)) {
      continue;
    }

    const relativePath = path.relative(ROOT, filePath);
    const lines = source.split("\n");
    lines.forEach((line, index) => {
      if (line.includes("className=") && line.includes("text-action")) {
        violations.push(`${relativePath}:${index + 1}`);
      }
    });
  }

  if (violations.length === 0) {
    return;
  }

  console.error("Raw text-action class usage found. Use TextActionButton/TextActionLink/TextActionLabel instead:");
  violations.forEach((violation) => {
    console.error(`- ${violation}`);
  });
  process.exit(1);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
