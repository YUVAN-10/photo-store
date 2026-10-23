import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { VaultProvider } from "@/lib/vault-context";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "FamilyVault — Private Family Photo Storage",
  description: "An extremely simple, private mobile photo gallery for family members.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#C87558",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
        <ThemeProvider>
          <VaultProvider>
            <AppShell>{children}</AppShell>
          </VaultProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
