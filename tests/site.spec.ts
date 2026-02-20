import { expect, test } from "@playwright/test";

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
  await expect(page.getByRole("heading", { name: "The Bridge, Reconstructed" })).toBeVisible();

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
