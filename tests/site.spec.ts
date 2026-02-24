import { expect, test } from "@playwright/test";
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

  await page.getByRole("link", { name: "about" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();

  await page.getByRole("link", { name: "contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("heading", { name: "Let's Talk" })).toBeVisible();

  await page.getByRole("link", { name: "press" }).click();
  await expect(page).toHaveURL(/\/press$/);
  await expect(page.getByRole("heading", { name: "Press Coverage" })).toBeVisible();
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

test("slideshow next project button opens next project in slideshow view", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed?photo=3");
  await expect(page.locator(".slideshow__counter")).toContainText(/^3\s*\/\s*\d+$/);

  await page.getByRole("button", { name: /next project:\s*urban courts/i }).click();
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

test("slideshow title opens thumbnails with current photo", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed?photo=4");
  await expect(page.locator(".slideshow__counter")).toContainText(/^4\s*\/\s*\d+$/);

  await page.getByTestId("slideshow-title-thumbnails-link").click();
  await expect(page).toHaveURL(/\/works\/personal\/the-bridge-reconstructed\/thumbnails\?photo=4$/);
});

test("project thumbnails page renders all project images", async ({ page }) => {
  await page.goto("/works/personal/the-bridge-reconstructed/thumbnails");

  await expect(page.getByRole("heading", { name: /the bridge/i })).toBeVisible();
  await expect(page.getByText("A new perspective on an iconic subject.")).toBeVisible();
  await expect(page.getByTestId("thumbnail-page-slideshow-link")).toBeVisible();
  await expect(page.getByTestId("thumbnail-page-next-project-link")).toContainText(
    /next project:\s*urban courts/i,
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

test("editor api is blocked when editor flags are not enabled", async ({ request }) => {
  const response = await request.get("/api/editor/state");
  expect(response.status()).toBe(403);
  const payload = await response.json();
  expect(payload.error).toContain("disabled");
});

test("edit mode toggle is hidden when public editor flag is not enabled", async ({ page }) => {
  await page.goto("/works");
  await expect(page.locator(".dev-editor-toggle")).toHaveCount(0);
});
