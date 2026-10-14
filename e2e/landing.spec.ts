import { test, expect } from "@playwright/test";

test.describe("landing page", () => {
  test("renders the sign-in card by default", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Correo electrónico", { exact: true }),
    ).toBeVisible();
  });

  test("requires accepting the Terms of Use and Privacy Policy before sign up", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(
      page.getByRole("link", { name: "Términos de uso" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/marioa-rz/Kontro/blob/main/docs/terms-of-use.md",
    );
    await expect(
      page.getByRole("link", { name: "Política de privacidad" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/marioa-rz/Kontro/blob/main/docs/privacy-policy.md",
    );

    await page.getByLabel("Nombre").fill("Test");
    await page.getByLabel("Apellido").fill("User");
    await page
      .getByLabel("Correo electrónico", { exact: true })
      .fill("no-terms@example.com");
    await page.locator("#auth-password").fill("Secure1!x");
    await page.locator("#auth-confirm-password").fill("Secure1!x");

    await page
      .getByRole("button", { name: "Registrarme con correo" })
      .click();

    await expect(
      page.getByText(
        "Debes aceptar los Términos de uso y la Política de privacidad para crear una cuenta.",
      ),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/\/dashboard/);
  });
});

test.describe("landing page locale selection", () => {
  test("renders Portuguese copy after selecting Portuguese", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Idioma").click();
    await page.getByRole("option", { name: "Portugués" }).click();

    await expect(
      page.getByText("Finanças pessoais, open source e gratuito."),
    ).toBeVisible();
  });
});

test.describe("landing page theme detection", () => {
  test.use({ colorScheme: "dark" });

  test("applies dark mode when the system prefers dark", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("landing page theme detection (light)", () => {
  test.use({ colorScheme: "light" });

  test("applies light mode when the system prefers light", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});

test.describe("landing page theme migration", () => {
  test.use({ colorScheme: "light" });

  test("preserves and migrates the legacy dark theme preference", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("dragg-theme", "dark");
    });
    await page.goto("/");

    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem("kontro-theme")),
      )
      .toBe("dark");
  });
});
