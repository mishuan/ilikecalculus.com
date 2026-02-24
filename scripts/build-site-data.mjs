#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const WORKSPACE_PATH = path.join(CONTENT_DIR, "workspace.json");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "generated-site-data.ts");

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertString(value, fieldPath) {
  assert(typeof value === "string" && value.trim().length > 0, `${fieldPath} must be a non-empty string`);
}

function assertPositiveInteger(value, fieldPath) {
  assert(Number.isInteger(value) && value > 0, `${fieldPath} must be a positive integer`);
}

function assertUnique(values, fieldPath) {
  const uniqueCount = new Set(values).size;
  assert(uniqueCount === values.length, `${fieldPath} must not contain duplicates`);
}

function validateImage(value, fieldPath) {
  assert(isPlainObject(value), `${fieldPath} must be an object`);
  assertString(value.src, `${fieldPath}.src`);
  assertPositiveInteger(value.width, `${fieldPath}.width`);
  assertPositiveInteger(value.height, `${fieldPath}.height`);
  assertString(value.alt, `${fieldPath}.alt`);
}

function validatePressItem(value, fieldPath) {
  assert(isPlainObject(value), `${fieldPath} must be an object`);
  assertString(value.outlet, `${fieldPath}.outlet`);
  assertString(value.title, `${fieldPath}.title`);
  assertString(value.url, `${fieldPath}.url`);
}

function validateWorkspace(workspace) {
  assert(isPlainObject(workspace), "workspace.json must contain an object");

  assert(isPlainObject(workspace.site), "workspace.site must be an object");
  assertString(workspace.site.name, "workspace.site.name");
  assertString(workspace.site.shortName, "workspace.site.shortName");
  assertString(workspace.site.tagline, "workspace.site.tagline");
  assertString(workspace.site.instagramUrl, "workspace.site.instagramUrl");
  assertString(workspace.site.blogUrl, "workspace.site.blogUrl");

  assert(isPlainObject(workspace.about), "workspace.about must be an object");
  assertString(workspace.about.title, "workspace.about.title");
  assert(Array.isArray(workspace.about.paragraphs), "workspace.about.paragraphs must be an array");
  workspace.about.paragraphs.forEach((paragraph, index) => {
    assertString(paragraph, `workspace.about.paragraphs[${index}]`);
  });
  validateImage(workspace.about.image, "workspace.about.image");

  assert(isPlainObject(workspace.contact), "workspace.contact must be an object");
  assertString(workspace.contact.title, "workspace.contact.title");
  assert(Array.isArray(workspace.contact.paragraphs), "workspace.contact.paragraphs must be an array");
  workspace.contact.paragraphs.forEach((paragraph, index) => {
    assertString(paragraph, `workspace.contact.paragraphs[${index}]`);
  });
  validateImage(workspace.contact.image, "workspace.contact.image");

  assert(Array.isArray(workspace.press), "workspace.press must be an array");
  workspace.press.forEach((item, index) => {
    validatePressItem(item, `workspace.press[${index}]`);
  });

  assert(Array.isArray(workspace.categories), "workspace.categories must be an array");
  workspace.categories.forEach((category, index) => {
    assertString(category, `workspace.categories[${index}]`);
  });
  assert(workspace.categories.length > 0, "workspace.categories must include at least one category");
  assertUnique(workspace.categories, "workspace.categories");

  assert(Array.isArray(workspace.projectOrder), "workspace.projectOrder must be an array");
  workspace.projectOrder.forEach((slug, index) => {
    assertString(slug, `workspace.projectOrder[${index}]`);
  });
  assertUnique(workspace.projectOrder, "workspace.projectOrder");

  assert(Array.isArray(workspace.featuredProjectSlugs), "workspace.featuredProjectSlugs must be an array");
  workspace.featuredProjectSlugs.forEach((slug, index) => {
    assertString(slug, `workspace.featuredProjectSlugs[${index}]`);
  });
  assertUnique(workspace.featuredProjectSlugs, "workspace.featuredProjectSlugs");
}

function validateProject(project, filePath, workspaceCategories) {
  const label = `project(${filePath})`;

  assert(isPlainObject(project), `${label} must be an object`);
  assertString(project.slug, `${label}.slug`);
  assertString(project.title, `${label}.title`);
  assert(typeof project.description === "string", `${label}.description must be a string`);

  assert(Array.isArray(project.categories), `${label}.categories must be an array`);
  assert(project.categories.length > 0, `${label}.categories must include at least one category`);
  project.categories.forEach((category, index) => {
    assertString(category, `${label}.categories[${index}]`);
    assert(
      workspaceCategories.has(category),
      `${label}.categories[${index}] must exist in workspace.categories`,
    );
  });
  assertUnique(project.categories, `${label}.categories`);

  assert(Array.isArray(project.images), `${label}.images must be an array`);

  const seenSrc = new Set();
  project.images.forEach((image, index) => {
    validateImage(image, `${label}.images[${index}]`);
    assert(
      image.src.startsWith(`/media/projects/${project.slug}/`),
      `${label}.images[${index}].src must live under /media/projects/${project.slug}/`,
    );
    assert(!seenSrc.has(image.src), `${label}.images has duplicate src: ${image.src}`);
    seenSrc.add(image.src);
  });

  assert(
    project.coverImage === null || isPlainObject(project.coverImage),
    `${label}.coverImage must be an object or null`,
  );

  if (project.coverImage) {
    validateImage(project.coverImage, `${label}.coverImage`);
    assert(
      project.coverImage.src.startsWith(`/media/projects/${project.slug}/`),
      `${label}.coverImage.src must live under /media/projects/${project.slug}/`,
    );

    const hasCoverImage = project.images.some((image) => image.src === project.coverImage.src);
    assert(hasCoverImage, `${label}.coverImage.src must reference an image in project.images`);
  } else {
    assert(
      project.images.length === 0,
      `${label}.coverImage can be null only when project.images is empty`,
    );
  }

  const fileName = path.basename(filePath, ".json");
  assert(fileName === project.slug, `${label}.slug must match file name (${fileName})`);
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function build() {
  const workspace = await loadJson(WORKSPACE_PATH);
  validateWorkspace(workspace);

  const projectFiles = (await fs.readdir(PROJECTS_DIR))
    .filter((name) => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const projects = [];
  const workspaceCategories = new Set(workspace.categories);

  for (const fileName of projectFiles) {
    const filePath = path.join(PROJECTS_DIR, fileName);
    const project = await loadJson(filePath);
    validateProject(project, fileName, workspaceCategories);
    projects.push(project);
  }

  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));

  assert(
    workspace.projectOrder.length === projects.length,
    "workspace.projectOrder length must exactly match the number of projects",
  );

  for (const slug of workspace.projectOrder) {
    assert(projectBySlug.has(slug), `workspace.projectOrder contains unknown project slug: ${slug}`);
  }

  for (const project of projects) {
    assert(
      workspace.projectOrder.includes(project.slug),
      `workspace.projectOrder is missing project slug: ${project.slug}`,
    );
  }

  for (const slug of workspace.featuredProjectSlugs) {
    assert(projectBySlug.has(slug), `workspace.featuredProjectSlugs contains unknown project slug: ${slug}`);
  }

  const orderedProjects = workspace.projectOrder.map((slug) => projectBySlug.get(slug));
  const categoryLabels = Object.fromEntries(workspace.categories.map((category) => [category, category]));

  const generatedSiteData = {
    site: workspace.site,
    about: workspace.about,
    contact: workspace.contact,
    press: workspace.press,
    projects: orderedProjects,
    featuredProjectSlugs: workspace.featuredProjectSlugs,
  };

  const output = [
    "/* This file is generated by scripts/build-site-data.mjs. Do not edit manually. */",
    "",
    `export const generatedCategoryOrder = ${JSON.stringify(workspace.categories, null, 2)} as const;`,
    "",
    `export const generatedCategoryLabels = ${JSON.stringify(categoryLabels, null, 2)} as const;`,
    "",
    `export const generatedSiteData = ${JSON.stringify(generatedSiteData, null, 2)} as const;`,
    "",
  ].join("\n");

  await fs.writeFile(OUTPUT_PATH, output, "utf8");

  console.log(
    JSON.stringify(
      {
        categories: workspace.categories.length,
        projects: orderedProjects.length,
        output: path.relative(ROOT, OUTPUT_PATH),
      },
      null,
      2,
    ),
  );
}

build().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
