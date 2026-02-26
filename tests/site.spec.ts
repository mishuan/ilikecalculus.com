import { expect, test } from "@playwright/test";
import workspaceContent from "../content/workspace.json";
import { projectsBySlug } from "../src/data/site-content";

test("home filters rows by category", async ({ page }) => {
  await page.goto("/");

  const rows = page.locator(".collage-row");
  const allCount = await rows.count();
  expect(allCount).toBeGreaterThan(1);

  await page.getByRole("button", { name: "portrait" }).click();
  const portraitCount = await rows.count();
  expect(portraitCount).toBeGreaterThan(0);
  expect(portraitCount).toBeLessThan(allCount);

  await page.getByRole("button", { name: "personal" }).click();
  const personalCount = await rows.count();
  expect(personalCount).toBeGreaterThan(0);
  expect(personalCount).toBeLessThan(allCount);
});

test("primary navigation routes work", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "projects" }).click();
  await expect(page).toHaveURL(/\/works$/);
  await expect(page.getByRole("heading", { name: "works" })).toBeVisible();

  await page.getByRole("link", { name: "contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("heading", { name: "Let's Talk" })).toBeVisible();

  await page.getByRole("link", { name: "where is" }).click();
  await expect(page).toHaveURL(/\/where$/);
  await expect(page.getByRole("heading", { name: "where is michael?" })).toBeVisible();

  await page.getByRole("link", { name: "press" }).click();
  await expect(page).toHaveURL(/\/press$/);
  await expect(page.getByRole("heading", { name: "Press Coverage" })).toBeVisible();
});

test("press page renders all configured press entries", async ({ page }) => {
  await page.goto("/press");
  await expect(page.locator(".press-item")).toHaveCount(workspaceContent.press.length);
  await expect(
    page.getByRole("link", { name: /a shockingly modernist project and others: four books of photographs/i }),
  ).toBeVisible();
});

test("works project page slideshow advances into next project", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed");
  await expect(page.getByRole("heading", { name: "The Bridge" })).toBeVisible();

  const counter = page.locator(".slideshow__counter");
  await expect(counter).toBeVisible();

  const counterText = await counter.innerText();
  const match = counterText.match(/(\d+)\s*\/\s*(\d+)/);
  expect(match).not.toBeNull();
  const total = Number(match ? match[2] : 0);
  expect(total).toBeGreaterThan(1);
  await page.locator("body").click();
  for (let step = 1; step < total; step += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/works\/personal\/urban-courts$/);
});

test("slideshow right tap on last photo opens next project in slideshow view", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed?photo=999");
  await expect(page.locator(".slideshow__counter")).toContainText(/^\d+\s*\/\s*\d+$/);

  await page.locator(".slideshow__tap--right").click();
  await expect(page).toHaveURL(/\/works\/personal\/urban-courts$/);
});

test("slideshow left tap moves back one photo", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed");
  const counter = page.locator(".slideshow__counter");
  await expect(counter).toContainText(/^1\s*\/\s*\d+$/);

  await page.locator(".slideshow__tap--right").click();
  await expect(counter).toContainText(/^2\s*\/\s*\d+$/);

  await page.locator(".slideshow__tap--left").click();
  await expect(counter).toContainText(/^1\s*\/\s*\d+$/);
});

test("works title opens project thumbnails route", async ({ page }) => {
  await page.goto("/");

  const firstProjectTitle = page.locator(".collage-row__title a").first();
  const titleText = await firstProjectTitle.innerText();
  await firstProjectTitle.click();

  await expect(page).toHaveURL(/\/works\/[^/]+\/[^/]+\/thumbnails$/);
  await expect(page.getByRole("heading", { name: new RegExp(titleText, "i") })).toBeVisible();
});

test("slideshow thumbnail view link opens thumbnails with current photo", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed?photo=3");
  await expect(page.locator(".slideshow__counter")).toContainText(/^3\s*\/\s*\d+$/);
  await expect(page.getByTestId("slideshow-thumbnail-view-link")).toHaveText("thumbnails");

  await page.getByTestId("slideshow-thumbnail-view-link").click();
  await expect(page).toHaveURL(/\/works\/personal\/the-bridge-reconstructed\/thumbnails\?photo=3$/);
});

test("dev editor toggle does not block slideshow thumbnail link", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed?photo=2");
  await expect(page.locator(".dev-editor-toggle")).toHaveCount(0);
  await page.getByTestId("slideshow-thumbnail-view-link").click();
  await expect(page).toHaveURL(/\/works\/personal\/the-bridge-reconstructed\/thumbnails\?photo=2$/);
});

test("slideshow title is non-link text", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed?photo=4");
  await expect(page.locator(".slideshow__counter")).toContainText(/^4\s*\/\s*\d+$/);

  await expect(page.locator(".viewer-topbar__title a")).toHaveCount(0);
  await expect(page.locator(".viewer-topbar__title")).toHaveText(/the bridge/i);
});

test("project thumbnails page renders all project images", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed/thumbnails");

  await expect(page.getByRole("heading", { name: /the bridge/i })).toBeVisible();
  await expect(page.getByText("A new perspective on an iconic subject.")).toBeVisible();
  await expect(page.getByTestId("thumbnail-page-slideshow-link")).toBeVisible();
  await expect(page.getByTestId("thumbnail-page-next-project-link")).toContainText(
    /next project\s*[-:>]+\s*urban courts/i,
  );
  await expect(page.locator("[data-testid^='project-thumbnail-']")).toHaveCount(
    projectsBySlug["the-bridge-reconstructed"].images.length,
  );
});

test("thumbnail page next project link stays in thumbnails view", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed/thumbnails");

  await page.getByTestId("thumbnail-page-next-project-link").click();
  await expect(page).toHaveURL(/\/works\/personal\/urban-courts\/thumbnails$/);
});

test("clicking a project thumbnail opens slideshow at the same photo", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed/thumbnails");

  await page.getByTestId("project-thumbnail-5").click();
  await expect(page).toHaveURL(/\/works\/personal\/the-bridge-reconstructed\?photo=5$/);
  await expect(page.locator(".slideshow__counter")).toContainText(/^5\s*\/\s*\d+$/);
});

test("slideshow close returns to works when opened from works list", async ({ page }) => {
  await page.goto("/works");

  await page.locator(".collage-row").first().locator(".collage-cell").first().click();
  await expect(page).toHaveURL(/\/works\/[^/]+\/[^/]+\?photo=\d+$/);

  await page.getByRole("button", { name: "Close slideshow" }).click();
  await expect(page).toHaveURL(/\/works$/);
});

test("slideshow close returns to thumbnails when opened from thumbnails", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed/thumbnails?photo=4");

  await page.getByTestId("project-thumbnail-7").click();
  await expect(page).toHaveURL(/\/works\/personal\/the-bridge-reconstructed\?photo=7$/);

  await page.getByRole("button", { name: "Close slideshow" }).click();
  await expect(page).toHaveURL(/\/works\/personal\/the-bridge-reconstructed\/thumbnails\?photo=4$/);
});

test("clicking a thumbnail opens slideshow at that photo", async ({ page }) => {
  await page.goto("/");

  const firstRow = page.locator(".collage-row").first();
  const secondThumb = firstRow.locator(".collage-cell").nth(1);
  await expect(secondThumb).toBeVisible();
  await secondThumb.click();

  await expect(page).toHaveURL(/photo=2/);
  await expect(page.locator(".slideshow__counter")).toContainText(/^2\s*\/\s*\d+$/);
});

test("blog route redirects to Substack", async ({ request }) => {
  const response = await request.get("/blog", { maxRedirects: 0 });
  expect([307, 308]).toContain(response.status());

  const location = response.headers()["location"];
  expect(location).toContain("ilikecalculus.substack.com");
});

test("about route permanently redirects to contact", async ({ request }) => {
  const response = await request.get("/about", { maxRedirects: 0 });
  expect(response.status()).toBe(308);

  const location = response.headers()["location"];
  expect(location).toContain("/contact");
});

test("editor api is available in development", async ({ request }) => {
  const response = await request.get("/api/editor/state");
  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(Array.isArray(payload.workspace?.categories)).toBe(true);
});

test("edit mode toggle is visible in development", async ({ page }) => {
  await page.goto("/works");
  await expect(page.locator(".dev-editor-toggle")).toHaveCount(1);
});

test("where page renders timeline and map", async ({ page }) => {
  await page.goto("/where");
  await expect(page.getByRole("heading", { name: "where is michael?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "current" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "past" })).toBeVisible();
  await expect(page.getByText("upcoming")).toBeVisible();
  await expect(page.locator(".where-map")).toBeVisible();
  await expect(page.getByTestId("where-view-toggle")).toBeVisible();

  const hasPastEmptyState = await page.getByText("No past locations yet.").count();
  const whereEntryCount = await page.locator(".where-entry").count();
  expect(hasPastEmptyState > 0 || whereEntryCount > 0).toBeTruthy();
});

test("where timeline toggles between list and calendar view", async ({ page }) => {
  await page.goto("/where");
  await expect(page.getByRole("heading", { level: 2, name: "current" })).toBeVisible();

  await page.getByTestId("where-view-calendar").click();
  await expect(page.getByTestId("where-calendar")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "current" })).toHaveCount(0);

  await page.getByTestId("where-view-list").click();
  await expect(page.getByRole("heading", { level: 2, name: "current" })).toBeVisible();
});

test("where calendar hover previews details and click keeps selected detail", async ({ page }) => {
  await page.goto("/where");
  await page.getByTestId("where-view-calendar").click();
  await expect(page.getByTestId("where-calendar")).toBeVisible();

  const emptyDay = page.locator(".where-calendar__day:not(.where-calendar__day--has-items)").first();
  await emptyDay.hover();

  const firstInteractiveDay = page.locator(".where-calendar__day--has-items").first();
  await expect(firstInteractiveDay.locator(".where-calendar__day-location")).toHaveCount(1);
  const previewLocationId = await firstInteractiveDay.getAttribute("data-preview-location-id");
  expect(previewLocationId).toBeTruthy();
  if (!previewLocationId) {
    throw new Error("Calendar day is missing preview location id.");
  }

  await firstInteractiveDay.hover();
  const hoverDetail = page.getByTestId(`where-calendar-detail-${previewLocationId}`);
  await expect(hoverDetail).toBeVisible();

  await firstInteractiveDay.click();
  await emptyDay.hover();
  await expect(page.getByTestId(`where-calendar-detail-${previewLocationId}`)).toBeVisible();

  const previewLocation = workspaceContent.where.locations.find((location) => location.id === previewLocationId);
  if (previewLocation?.note) {
    await expect(page.getByTestId(`where-calendar-detail-${previewLocationId}`)).toContainText(previewLocation.note);
  }
});

test("where timeline and map panels keep equal desktop heights", async ({ page }) => {
  await page.goto("/where");

  const timeline = page.locator(".where-timeline");
  const mapPanel = page.locator(".where-map-panel");
  await expect(timeline).toBeVisible();
  await expect(mapPanel).toBeVisible();

  const timelineBox = await timeline.boundingBox();
  const mapPanelBox = await mapPanel.boundingBox();
  expect(timelineBox).not.toBeNull();
  expect(mapPanelBox).not.toBeNull();

  if (!timelineBox || !mapPanelBox) {
    return;
  }

  const heightDifference = Math.abs(timelineBox.height - mapPanelBox.height);
  expect(heightDifference).toBeLessThan(3);
});

test("where list preview uses hover and selected states", async ({ page }) => {
  await page.goto("/where");

  const rows = page.locator(".where-entry");
  expect(await rows.count()).toBeGreaterThan(1);

  const selectedRow = page.locator(".where-entry--selected").first();
  await expect(selectedRow).toBeVisible();
  await expect(selectedRow.locator(".where-entry__note")).toHaveCount(1);
  await expect(selectedRow.locator(".where-entry__hover-note")).toHaveCount(0);

  const secondaryRow = rows.nth(1);
  await expect(secondaryRow.locator(".where-entry__note")).toHaveCount(0);
  await expect(secondaryRow.locator(".where-entry__hover-note")).toHaveCount(0);

  await secondaryRow.hover();
  await expect(secondaryRow.locator(".where-entry__note")).toHaveCount(0);
  await expect(secondaryRow.locator(".where-entry__hover-note")).toHaveCount(1);
  await expect(selectedRow.locator(".where-entry__note")).toHaveCount(1);

  await page.locator(".page-title").hover();
  await expect(secondaryRow.locator(".where-entry__hover-note")).toHaveCount(0);
  await expect(selectedRow.locator(".where-entry__note")).toHaveCount(1);
});

test("where map node click selects matching timeline row", async ({ page }) => {
  await page.goto("/where");

  const locations = workspaceContent.where.locations;
  expect(locations.length).toBeGreaterThan(0);

  const target = locations[0];
  const clickedNode = await page.evaluate((locationId) => {
    const selector = `[data-testid=\"where-map-node-hit-${locationId}\"]`;
    const nodes = Array.from(document.querySelectorAll<SVGCircleElement>(selector));
    if (nodes.length === 0) {
      return false;
    }

    const inViewport = nodes.find((node) => {
      const rect = node.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        rect.top < window.innerHeight
      );
    });

    const node = inViewport ?? nodes[0];
    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }, target.id);
  expect(clickedNode).toBeTruthy();
  await expect(page.getByTestId(`where-entry-${target.id}`)).toHaveClass(/where-entry--selected/);
});

test("contact page includes about and contact copy", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Let's Talk" })).toBeVisible();
  await expect(page.getByText("Hey there! I’m Michael Yuan.")).toBeVisible();
  await expect(page.getByText("By day, I’m a software engineer at Figma")).toBeVisible();
  await expect(page.getByText("If you’re curious, I’ll also tell you the origin story behind ilikecalculus.")).toBeVisible();
});

test("where edit controls only appear in edit mode", async ({ page }) => {
  await page.goto("/where");
  await expect(page.getByTestId("where-add-location-editor")).toHaveCount(0);
  await expect(page.locator(".dev-editor-toggle")).toHaveCount(1);

  await page.locator(".dev-editor-toggle").click();
  await expect(page).toHaveURL(/\/where\?edit=1$/);
  await expect(page.getByTestId("where-add-location-editor")).toHaveCount(1);
});
