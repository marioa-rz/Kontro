import { test, expect } from "@playwright/test";

test("configures a category budget and sees it reflected on the Budgets page", async ({
  page,
}) => {
  const categoryName = `E2E Budget ${Date.now()}`;

  await page.goto("/categories");
  await page.getByRole("button", { name: "Nueva categoría" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator("#category-name").fill(categoryName);
  await dialog.getByRole("button", { name: "Crear categoría" }).click();

  await expect(page.getByText("Categoría creada correctamente.")).toBeVisible();
  await expect(
    page.getByRole("main").getByText(categoryName, { exact: true }),
  ).toBeVisible();

  await page.goto("/budgets");

  await expect(
    page.getByRole("heading", { name: "Presupuestos" }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByText("Presupuestos por categoría"),
  ).toBeVisible();

  const categoryBudget = page
    .getByText(categoryName, { exact: true })
    .locator("../..");
  await expect(categoryBudget).toBeVisible();
  await categoryBudget
    .getByRole("button", { name: "Configurar presupuesto" })
    .click();

  const budgetDialog = page.getByRole("dialog");
  await budgetDialog.locator("#category-limit").fill("30000");
  await budgetDialog
    .getByRole("button", { name: "Guardar presupuesto" })
    .click();

  await expect(page.getByText("Categoría actualizada correctamente.")).toBeVisible();
  await expect(
    categoryBudget.getByText(/^Q\s*0\.00\s*\/\s*Q\s*300\.00$/),
  ).toBeVisible();
});
