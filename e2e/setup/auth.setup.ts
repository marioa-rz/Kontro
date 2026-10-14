import { test as setup, expect } from "@playwright/test";

import { createTestUser } from "../fixtures/test-user";

const authFile = "e2e/.auth/user.json";

setup("sign up and save authenticated session", async ({ page }) => {
  const user = createTestUser();

  await page.goto("/");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await page.getByLabel("Nombre").fill(user.firstName);
  await page.getByLabel("Apellido").fill(user.lastName);
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill(user.email);
  await page.locator("#auth-password").fill(user.password);
  await page.locator("#auth-confirm-password").fill(user.password);
  await page.locator("#auth-accept-terms").click();

  await page
    .getByRole("button", { name: "Registrarme con correo" })
    .click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
