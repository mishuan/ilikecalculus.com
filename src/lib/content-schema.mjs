function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNonEmptyString(value, fieldPath) {
  assert(typeof value === "string" && value.trim().length > 0, `${fieldPath} must be a non-empty string`);
}

function assertPositiveInteger(value, fieldPath) {
  assert(Number.isInteger(value) && Number(value) > 0, `${fieldPath} must be a positive integer`);
}

function assertFiniteNumber(value, fieldPath) {
  assert(typeof value === "number" && Number.isFinite(value), `${fieldPath} must be a finite number`);
}

function assertNumberInRange(value, min, max, fieldPath) {
  assertFiniteNumber(value, fieldPath);
  assert(value >= min && value <= max, `${fieldPath} must be between ${min} and ${max}`);
}

function assertUtcIsoDateTime(value, fieldPath) {
  assert(typeof value === "string" && value.length > 0, `${fieldPath} must be a non-empty string`);

  const parsed = new Date(value);
  assert(!Number.isNaN(parsed.getTime()), `${fieldPath} must be a valid ISO datetime`);
  assert(value.endsWith("Z"), `${fieldPath} must be UTC (ending in Z)`);
  assert(parsed.toISOString() === value, `${fieldPath} must be a canonical ISO datetime`);
}

function assertUnique(values, fieldPath) {
  assert(new Set(values).size === values.length, `${fieldPath} must not contain duplicates`);
}

function toCategorySet(workspaceCategories) {
  if (workspaceCategories instanceof Set) {
    return workspaceCategories;
  }

  if (Array.isArray(workspaceCategories)) {
    return new Set(workspaceCategories);
  }

  throw new Error("workspaceCategories must be an array or Set");
}

export function normalizeSlug(rawValue) {
  return rawValue
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCategory(rawValue) {
  return rawValue.trim().toLowerCase().replace(/\s+/g, "-");
}

export function validateImage(image, fieldPath) {
  assert(isPlainObject(image), `${fieldPath} must be an object`);
  assertNonEmptyString(image.src, `${fieldPath}.src`);
  assertPositiveInteger(image.width, `${fieldPath}.width`);
  assertPositiveInteger(image.height, `${fieldPath}.height`);
  assertNonEmptyString(image.alt, `${fieldPath}.alt`);
}

export function validateWorkspace(workspace) {
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
  workspace.about.paragraphs.forEach((paragraph, index) => {
    assertNonEmptyString(paragraph, `workspace.about.paragraphs[${index}]`);
  });
  validateImage(workspace.about.image, "workspace.about.image");

  assert(isPlainObject(workspace.contact), "workspace.contact must be an object");
  assertNonEmptyString(workspace.contact.title, "workspace.contact.title");
  assert(Array.isArray(workspace.contact.paragraphs), "workspace.contact.paragraphs must be an array");
  workspace.contact.paragraphs.forEach((paragraph, index) => {
    assertNonEmptyString(paragraph, `workspace.contact.paragraphs[${index}]`);
  });
  validateImage(workspace.contact.image, "workspace.contact.image");

  assert(Array.isArray(workspace.press), "workspace.press must be an array");
  workspace.press.forEach((item, index) => {
    assert(isPlainObject(item), `workspace.press[${index}] must be an object`);
    assertNonEmptyString(item.outlet, `workspace.press[${index}].outlet`);
    assertNonEmptyString(item.title, `workspace.press[${index}].title`);
    assertNonEmptyString(item.url, `workspace.press[${index}].url`);
  });

  assert(Array.isArray(workspace.categories), "workspace.categories must be an array");
  workspace.categories.forEach((category, index) => {
    assertNonEmptyString(category, `workspace.categories[${index}]`);
  });
  assert(workspace.categories.length > 0, "workspace.categories must include at least one category");
  assertUnique(workspace.categories, "workspace.categories");

  assert(Array.isArray(workspace.projectOrder), "workspace.projectOrder must be an array");
  workspace.projectOrder.forEach((slug, index) => {
    assertNonEmptyString(slug, `workspace.projectOrder[${index}]`);
  });
  assertUnique(workspace.projectOrder, "workspace.projectOrder");

  assert(Array.isArray(workspace.featuredProjectSlugs), "workspace.featuredProjectSlugs must be an array");
  workspace.featuredProjectSlugs.forEach((slug, index) => {
    assertNonEmptyString(slug, `workspace.featuredProjectSlugs[${index}]`);
  });
  assertUnique(workspace.featuredProjectSlugs, "workspace.featuredProjectSlugs");

  assert(isPlainObject(workspace.where), "workspace.where must be an object");
  assert(Array.isArray(workspace.where.locations), "workspace.where.locations must be an array");
  const locationIds = new Set();
  workspace.where.locations.forEach((location, index) => {
    assert(isPlainObject(location), `workspace.where.locations[${index}] must be an object`);
    assertNonEmptyString(location.id, `workspace.where.locations[${index}].id`);
    assert(!locationIds.has(location.id), `workspace.where.locations duplicate id: ${location.id}`);
    locationIds.add(location.id);
    assertNonEmptyString(location.label, `workspace.where.locations[${index}].label`);
    assertNumberInRange(location.latitude, -90, 90, `workspace.where.locations[${index}].latitude`);
    assertNumberInRange(location.longitude, -180, 180, `workspace.where.locations[${index}].longitude`);
    assertUtcIsoDateTime(location.at, `workspace.where.locations[${index}].at`);
    assert(typeof location.note === "string", `workspace.where.locations[${index}].note must be a string`);
  });
}

export function validateProjectManifest(project, workspaceCategories) {
  const categorySet = toCategorySet(workspaceCategories);

  assert(isPlainObject(project), "project must be an object");
  assertNonEmptyString(project.slug, "project.slug");
  assertNonEmptyString(project.title, "project.title");
  assert(typeof project.description === "string", "project.description must be a string");

  assert(Array.isArray(project.categories), "project.categories must be an array");
  assert(project.categories.length > 0, "project.categories must include at least one category");
  project.categories.forEach((category, index) => {
    assertNonEmptyString(category, `project.categories[${index}]`);
    assert(categorySet.has(category), `project.categories[${index}] must exist in workspace.categories`);
  });
  assertUnique(project.categories, "project.categories");

  assert(Array.isArray(project.images), "project.images must be an array");

  const seenSrc = new Set();
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
    assert(project.images.length === 0, "project.coverImage can be null only when project.images is empty");
  }
}

export function validateContentBundle(workspace, projects) {
  validateWorkspace(workspace);
  const categorySet = new Set(workspace.categories);

  const projectBySlug = new Map();
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
