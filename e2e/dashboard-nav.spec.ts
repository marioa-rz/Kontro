import { test, expect } from "@playwright/test";

test.describe("dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("renders the summary cards", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByText("Ingresos totales")).toBeVisible();
    await expect(main.getByText("Gastos totales")).toBeVisible();
    await expect(main.getByText("Total ahorrado")).toBeVisible();
    await expect(main.getByText("Saldo disponible")).toBeVisible();
  });

  test("navigates through every sidebar section", async ({ page }) => {
    const sections: Array<[name: string, path: string]> = [
      ["Movimientos", "/transactions"],
      ["Categorías", "/categories"],
      ["Presupuestos", "/budgets"],
      ["Pagos", "/payments"],
      ["Reportes", "/reports"],
      ["Metas", "/goals"],
      ["Configuración", "/settings"],
      ["Resumen", "/dashboard"],
    ];

    for (const [name, path] of sections) {
      await page.getByRole("link", { name, exact: true }).click();
      await page.waitForURL((url) => url.pathname === path);
      expect(new URL(page.url()).pathname).toBe(path);
    }
  });
});
