import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(path: string) {
  return readFileSync(`${ROOT}/${path}`, "utf8");
}

describe("Kontro logo", () => {
  it("uses the rose K mark everywhere the product logo is rendered", () => {
    const logo = read("public/kontro-icon.svg");
    const productFiles = [
      "README.md",
      "app/layout.tsx",
      "app/loading.tsx",
      "components/auth/auth-card-header.tsx",
      "components/dashboard/header.tsx",
      "components/dashboard/sidebar.tsx",
      "components/landing/landing-content.tsx",
    ].map(read);

    expect(logo).toContain('aria-label="Kontro"');
    expect(logo).toMatch(/<rect[^>]+fill="#FFF1F2"/);
    expect(logo).toMatch(/<text[^>]+fill="#BE123C"/s);
    expect(logo).toMatch(/>K<\/text>/);
    expect(productFiles.every((file) => file.includes("kontro-icon.svg"))).toBe(
      true,
    );
    expect(productFiles.some((file) => file.includes("dragg-icon"))).toBe(
      false,
    );
    expect(read("app/layout.tsx")).toContain(
      'apple: "/kontro-icon-apple.png"',
    );
    expect(existsSync(`${ROOT}/public/kontro-icon-apple.png`)).toBe(true);
    expect(read("components/auth/auth-card-header.tsx")).not.toContain(
      "34,197,94",
    );
  });
});
