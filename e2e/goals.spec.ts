import { test, expect } from "@playwright/test";

test("creates a goal, adds funds, and deletes it", async ({ page }) => {
  const goalName = `E2E Goal ${Date.now()}`;

  await page.goto("/goals");

  // Create
  await page.getByRole("button", { name: "Nueva meta" }).first().click();
  const createDialog = page.getByRole("dialog");
  await createDialog.locator("#goal-name").fill(goalName);
  await createDialog.locator("#goal-target").pressSequentially("100000");
  await createDialog.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Meta creada correctamente.")).toBeVisible();

  const card = page.locator('[data-slot="card"]').filter({ hasText: goalName });
  await expect(card).toBeVisible();

  // Add funds
  await card.getByRole("button", { name: "Agregar fondos" }).click();
  const fundDialog = page.getByRole("dialog");
  await fundDialog.locator("#goal-fund-amount").pressSequentially("5000");
  await fundDialog.getByRole("button", { name: "Agregar fondos" }).click();

  await expect(page.getByText("Fondos agregados correctamente.")).toBeVisible();

  // Delete
  await card
    .getByRole("button")
    .filter({ has: page.locator("svg.lucide-ellipsis-vertical") })
    .click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Eliminar", exact: true })
    .click();

  await expect(page.getByText("Meta eliminada correctamente.")).toBeVisible();
  await expect(page.locator('[data-slot="card"]').filter({ hasText: goalName })).toHaveCount(0);
});
