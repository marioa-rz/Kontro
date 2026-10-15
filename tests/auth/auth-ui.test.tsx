import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { LoginCard } from "@/components/auth/login-card";
import { PasswordRequirementsChecklist } from "@/components/auth/password-requirements-checklist";
import { TermsAcceptanceCheckbox } from "@/components/auth/terms-acceptance-checkbox";
import { UpdatePasswordCard } from "@/components/auth/update-password-card";

const translations: Record<string, string> = {
  "auth.acceptTermsAnd": "and",
  "auth.acceptTermsPrefix": "I have read and agree to the",
  "auth.backToSignIn": "Back to sign in",
  "auth.checkYourEmail": "Check your email",
  "auth.confirmPassword": "Confirm password",
  "auth.continueWithGoogle": "Continue with Google",
  "auth.createAccount": "Create account",
  "auth.email": "Email",
  "auth.footer": "Open source.",
  "auth.forgotPassword": "Forgot password?",
  "auth.kicker": "Personal finance clarity",
  "auth.newPassword": "New password",
  "auth.orContinueWithEmail": "or continue with email",
  "auth.password": "Password",
  "auth.privacyPolicy": "Privacy Policy",
  "auth.passwordRequirementsTitle": "Your password must include:",
  "auth.passwordRequirementMinLength": "At least 8 characters",
  "auth.passwordRequirementLowercase": "One lowercase letter",
  "auth.passwordRequirementUppercase": "One uppercase letter",
  "auth.passwordRequirementNumber": "One number",
  "auth.passwordRequirementSymbol": "One symbol",
  "auth.resetPasswordInstructions": "Enter your email for reset instructions.",
  "auth.signIn": "Sign in",
  "auth.signInDescription": "Sign in with Google or your email and password.",
  "auth.signInWithEmail": "Sign in with email",
  "auth.signUp": "Sign up",
  "auth.signUpDescription":
    "Create an account with your name, email, and password.",
  "auth.signUpWithEmail": "Sign up with email",
  "auth.alreadyHaveAccount": "Already have an account? Sign in",
  "auth.termsOfUse": "Terms of Use",
  "screen.settings.firstName": "First Name",
  "screen.settings.lastName": "Last Name",
  "auth.updatePassword": "Update password",
  "auth.updatePasswordInstructions": "Choose a new password.",
  "screen.settings.language": "Language",
};

const replace = vi.fn();
const refresh = vi.fn();
const unsubscribe = vi.fn();
const getUser = vi.fn();
const signUp = vi.fn();
let authStateListener:
  | ((event: string, session: { user: { id: string } } | null) => void)
  | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
    replace,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser,
      onAuthStateChange: vi.fn((listener) => {
        authStateListener = listener;
        return { data: { subscription: { unsubscribe } } };
      }),
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp,
      updateUser: vi.fn(),
    },
  }),
}));

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    locale: "en",
    setLocale: vi.fn(),
    t: (key: string) => translations[key] ?? key,
  }),
}));

describe("auth callback redirect safety", () => {
  it("falls back to /dashboard for null, non-absolute, and protocol-relative paths", () => {
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- asserting this insecure URL is rejected
    expect(getSafeRedirectPath("http://evil.com")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.com")).toBe("/dashboard");
  });

  it("falls back to /dashboard for paths with escape sequences", () => {
    expect(getSafeRedirectPath("/path\\to")).toBe("/dashboard");
    expect(getSafeRedirectPath("/path\ninjection")).toBe("/dashboard");
    expect(getSafeRedirectPath("/path\rinjection")).toBe("/dashboard");
  });

  it("returns valid absolute paths unchanged", () => {
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("/transactions?type=expense")).toBe(
      "/transactions?type=expense",
    );
  });
});

describe("auth UI", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
    authStateListener = undefined;
    getUser.mockReset().mockResolvedValue({
      data: { user: null },
      error: null,
    });
    signUp.mockReset().mockResolvedValue({
      data: { session: null },
      error: null,
    });
    refresh.mockClear();
    replace.mockClear();
    unsubscribe.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects the pending sign-up screen when email confirmation creates a session", () => {
    render(<LoginCard />);

    act(() => {
      authStateListener?.("SIGNED_IN", { user: { id: "user-1" } });
    });

    expect(replace).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("detects the server-created confirmation cookie while the sign-up tab remains open", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "confirmed-user" } },
      error: null,
    });
    render(<LoginCard />);

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "María" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "López" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "maria@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Strong1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Strong1!" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Sign up with email" }));

    await waitFor(() => expect(getUser).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("renders Google and email/password sign-in options", () => {
    const html = renderToStaticMarkup(<LoginCard />);

    expect(html).toContain("Continue with Google");
    expect(html).toContain("or continue with email");
    expect(html).toContain("Email");
    expect(html).toContain("Password");
    expect(html).toContain("Sign in with email");
    expect(html).toContain("Forgot password?");
    expect(html).toContain("Create account");
  });

  it("renders the password requirements checklist", () => {
    const html = renderToStaticMarkup(
      <PasswordRequirementsChecklist password="Aa1!" />,
    );

    expect(html).toContain("Your password must include:");
    expect(html).toContain("At least 8 characters");
    expect(html).toContain("One lowercase letter");
    expect(html).toContain("One uppercase letter");
    expect(html).toContain("One number");
    expect(html).toContain("One symbol");
  });

  it("renders the terms acceptance checkbox with links and an error", () => {
    const html = renderToStaticMarkup(
      <TermsAcceptanceCheckbox
        checked={false}
        disabled={false}
        error="You must accept the Terms of Use and Privacy Policy to create an account."
        onCheckedChange={() => {}}
      />,
    );

    expect(html).toContain("I have read and agree to the");
    expect(html).toContain("Terms of Use");
    expect(html).toContain("Privacy Policy");
    expect(html).toContain(
      'href="https://github.com/marioa-rz/Kontro/blob/main/docs/terms-of-use.md"',
    );
    expect(html).toContain(
      'href="https://github.com/marioa-rz/Kontro/blob/main/docs/privacy-policy.md"',
    );
    expect(html).toContain(
      "You must accept the Terms of Use and Privacy Policy to create an account.",
    );
  });

  it("renders the password update form", () => {
    const html = renderToStaticMarkup(<UpdatePasswordCard />);

    expect(html).toContain("Update password");
    expect(html).toContain("New password");
    expect(html).toContain("Choose a new password.");
  });
});
