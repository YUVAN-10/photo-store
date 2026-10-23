"use client";

import React from "react";
import Link from "next/link";
import { Camera, ShieldCheck, UserCheck, LogIn } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { ThemeToggle } from "./ThemeToggle";
import { StorageBar } from "./StorageBar";

export function Header() {
  const { currentMember, members, switchMember } = useVault();

  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-border px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo (visible on mobile where sidebar is hidden) */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/photos" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-warm shadow-primary/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-foreground block leading-tight">
                FamilyVault
              </span>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-secondary" /> Private
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop title / greetings */}
        <div className="hidden md:flex items-center gap-3">
          {currentMember ? (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-foreground">
                Welcome, {currentMember.name}
              </span>
              <span className="text-xs text-muted-foreground">({currentMember.relation})</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in to your vault</span>
            </Link>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <StorageBar compact />

          {/* Quick Member switcher pill for mobile */}
          {currentMember && (
            <div className="relative group md:hidden">
              <button
                className="touch-target flex items-center gap-2 p-1.5 rounded-full bg-muted/80 hover:bg-muted text-xs font-semibold text-foreground pr-3"
                title="Active Profile"
              >
                {currentMember.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentMember.avatar}
                    alt={currentMember.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                    {currentMember.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[70px] truncate">{currentMember.name}</span>
              </button>

              {/* Dropdown to switch profiles (if multiple members exist) */}
              {members.length > 1 && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-2xl shadow-xl border border-border p-2 hidden group-hover:block z-50">
                  <div className="text-[11px] font-bold text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-primary" /> Switch Member
                  </div>
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => switchMember(m.id)}
                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-medium hover:bg-muted flex items-center gap-2 text-foreground"
                    >
                      {m.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center">
                          {m.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span>{m.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">({m.relation})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
