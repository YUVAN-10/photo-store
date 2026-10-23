"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useVault } from "@/lib/vault-context";
import { ShieldAlert, Smartphone, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isDeviceApproved, currentMember, approvePendingDevice } = useVault();

  // If on /login page, display cleanly without sidebar/nav
  if (pathname === "/login") {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  // If not authenticated, prompt to login
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface p-8 rounded-3xl shadow-warm-lg border border-border text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to FamilyVault</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Please enter your family phone number to access your private family photos.
            </p>
          </div>
          <Link href="/login" className="block">
            <Button size="lg" className="w-full">
              Enter FamilyVault <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // If device is not approved yet (e.g. Grandma logging in from a brand new tablet)
  if (!isDeviceApproved && currentMember) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface p-8 rounded-3xl shadow-warm-lg border border-border text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Device Detected</h1>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Hello <strong>{currentMember.name}</strong>! For your family’s privacy, this device needs a quick approval from your family administrator before opening the photo vault.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-left text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Smartphone className="w-4 h-4 text-primary" />
              <span>Current Device: {currentMember.name}&apos;s Device</span>
            </div>
            <p>A notification has been sent to your family administrator.</p>
          </div>

          {/* Device approval button */}
          <div className="pt-2 border-t border-border space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => approvePendingDevice(currentMember.id, "dev-current")}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Authorize This Device
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
