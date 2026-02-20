import { expect, test } from "@playwright/test";

test("primary navigation routes work", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/works$/);
  await expect(page.getByRole("heading", { name: "All Work" })).toBeVisible();

  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();

  await page.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("heading", { name: "Let's Talk" })).toBeVisible();

  await page.getByRole("link", { name: "Press" }).click();
  await expect(page).toHaveURL(/\/press$/);
  await expect(page.getByRole("heading", { name: "Press Coverage" })).toBeVisible();
});

test("works project page renders images and supports scroll", async ({ page }) => {
  await page.goto("/works/the-bridge-reconstructed");
  await expect(page.getByRole("heading", { name: "The Bridge, Reconstructed" })).toBeVisible();

  const imageCount = await page.locator("img").count();
  expect(imageCount).toBeGreaterThan(10);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  expect(scrollHeight).toBeGreaterThan(viewportHeight);

  await page.mouse.wheel(0, 3200);
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
});

test("blog route redirects to Substack", async ({ request }) => {
  const response = await request.get("/blog", { maxRedirects: 0 });
  expect([307, 308]).toContain(response.status());

  const location = response.headers()["location"];
  expect(location).toContain("ilikecalculus.substack.com");
});
