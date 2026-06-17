import { expect, test } from "@playwright/test";

test.describe("PDF→PNG app", () => {
  test("loads the home screen", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("heading", { name: /Convert PDF to PNG/i })).toBeVisible();
    await expect(page.getByText(/Drop a PDF here/i)).toBeVisible();
  });

  test("opens the About dialog from the menu", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("button", { name: /open menu/i }).first().click();
    await page.getByText("About", { exact: true }).click();
    await expect(page.getByRole("heading", { name: /About PDF/i })).toBeVisible();
  });
});
