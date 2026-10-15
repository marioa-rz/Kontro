import { test, expect } from "@playwright/test";

test("creates, edits, and deletes a transaction", async ({ page }) => {
  const description = `E2E groceries ${Date.now()}`;
  const updatedDescription = `${description} (updated)`;

  await page.goto("/transactions");

  // Create
  await page.getByRole("button", { name: "Agregar movimiento" }).click();
  const addDialog = page.getByRole("dialog");
  await addDialog.locator("#amount").pressSequentially("5000");
  await addDialog.getByRole("button", { name: /Alimentación/ }).click();
  await addDialog.locator("#description").fill(description);
  await addDialog.getByRole("button", { name: "Efectivo", exact: true }).click();
  await addDialog.getByRole("button", { name: "Guardar movimiento" }).click();

  await expect(page.getByText("Movimiento registrado correctamente.")).toBeVisible();
  await expect(page.getByText(description, { exact: true })).toBeVisible();

  // Edit
  await page.getByText(description, { exact: true }).click();
  const editDialog = page.getByRole("dialog");
  await editDialog.locator("#transaction-description").fill(updatedDescription);
  await editDialog.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(
    page.getByText("Movimiento actualizado correctamente."),
  ).toBeVisible();
  await expect(page.getByText(updatedDescription, { exact: true })).toBeVisible();

  // Delete
  const rowButton = page.getByRole("button", { name: updatedDescription });
  await rowButton.locator("xpath=following-sibling::button[1]").click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Eliminar", exact: true })
    .click();

  await expect(
    page.getByText("Movimiento eliminado correctamente."),
  ).toBeVisible();
  await expect(page.getByText(updatedDescription, { exact: true })).toHaveCount(0);
});
