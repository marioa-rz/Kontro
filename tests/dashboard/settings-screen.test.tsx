import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsScreen } from "@/components/dashboard/settings-screen";

const { setTheme, themeState } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  themeState: { resolvedTheme: "dark" },
}));

vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ resolvedTheme: themeState.resolvedTheme, setTheme }),
}));

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    currency: "GTQ",
    formatDate: () => "14 oct 2026",
    locale: "es-GT",
    setCurrency: vi.fn(),
    setLocale: vi.fn(),
    t: (key: string) =>
      ({
        "user.logout": "Cerrar sesión",
        "theme.toggle": "Cambiar tema",
      })[key] ?? key,
  }),
}));

describe("SettingsScreen", () => {
  it("shows the sign-out action in the profile section on every viewport", () => {
    themeState.resolvedTheme = "dark";
    render(
      <SettingsScreen
        profile={{
          avatarUrl: null,
          createdAt: "2026-10-14T12:00:00Z",
          email: "maria@example.com",
          firstName: "María",
          fullName: "María López",
          lastName: "López",
        }}
        signOutAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Cambiar tema" }));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("can switch from the light theme to the dark theme", () => {
    themeState.resolvedTheme = "light";
    render(
      <SettingsScreen
        profile={{
          avatarUrl: null,
          createdAt: "2026-10-14T12:00:00Z",
          email: "maria@example.com",
          firstName: "María",
          fullName: "María López",
          lastName: "López",
        }}
        signOutAction={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cambiar tema" }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
