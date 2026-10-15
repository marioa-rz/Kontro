import { test, expect } from "@playwright/test";

test("configures a category budget and sees it reflected on the Budgets page", async ({
  page,
}) => {
  const categoryName = `E2E Budget ${Date.now()}`;

  await page.goto("/categories");
  await page.getByRole("button", { name: "Nueva categoría" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator("#category-name").fill(categoryName);
  await dialog.locator("#category-limit").pressSequentially("30000");
  await dialog.getByRole("button", { name: "Crear categoría" }).click();

  await expect(page.getByText("Categoría creada correctamente.")).toBeVisible();
  await expect(page.getByText(categoryName, { exact: true })).toBeVisible();

  await page.goto("/budgets");

  await expect(
    page.getByRole("heading", { name: "Presupuestos" }),
  ).toBeVisible();
  await expect(page.getByText("Presupuestos por categoría")).toBeVisible();
  await expect(page.getByText(categoryName, { exact: true })).toBeVisible();
});
