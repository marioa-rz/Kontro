import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n";
import { REPOSITORY_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi/satoshi-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const DESCRIPTION =
  "Aplicación de finanzas personales de código abierto para controlar ingresos, gastos, presupuestos, metas y reportes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kontro – Control de finanzas personales",
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "personal finance",
    "expense tracker",
    "budget app",
    "open source finance",
    "self-hosted budget tracker",
    "finance dashboard",
    "free budget app",
    "nextjs finance app",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Kontro – Control de finanzas personales",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontro – Control de finanzas personales",
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      {
        url: "/dragg-icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/dragg-icon-app.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF9F1" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D0E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("kontro-theme")||localStorage.getItem("dragg-theme");var d=t==="dark"||t==="light"?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  alternateName: "Kontro Finanzas",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  inLanguage: "es-GT",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GTQ",
  },
  url: SITE_URL,
  sameAs: [REPOSITORY_URL],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT" suppressHydrationWarning>
      <body
        className={`${satoshi.variable} bg-background font-sans antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STRUCTURED_DATA),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
        <SpeedInsights />
      </body>
    </html>
  );
}
