"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Image as ImageIcon,
  FolderHeart,
  PlusCircle,
  Heart,
  Users,
  Trash2,
  ShieldCheck,
  LogOut,
  Camera,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVault } from "@/lib/vault-context";
import { StorageBar } from "./StorageBar";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const { currentMember, logout, switchMember, members } = useVault();

  const links = [
    { label: "Photos", href: "/photos", icon: ImageIcon },
    { label: "Albums", href: "/albums", icon: FolderHeart },
    { label: "Upload", href: "/upload", icon: PlusCircle, highlight: true },
    { label: "Favorites", href: "/favorites", icon: Heart },
    { label: "Family & Access", href: "/family", icon: Users },
    { label: "Trash Bin", href: "/trash", icon: Trash2 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-surface border-r border-border min-h-screen p-5 shrink-0 justify-between sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/photos" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-warm shadow-primary/20 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-foreground block">
                FamilyVault
              </span>
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Private &amp; Safe
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Security & Privacy Badge */}
        <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-xs text-foreground/90">
          <span className="font-bold text-secondary block mb-0.5">🔒 Private Family Vault</span>
          <span className="text-muted-foreground">Safe photo sharing for your family</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "touch-target flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-150",
                  isActive
                    ? "bg-primary text-white shadow-warm"
                    : item.highlight
                    ? "text-primary hover:bg-primary/10"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Storage Bar in Sidebar */}
        <div className="pt-2">
          <StorageBar />
        </div>
      </div>

      {/* Member Profile Footer */}
      <div className="pt-6 border-t border-border space-y-3">
        {currentMember ? (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-muted/40">
            <div className="flex items-center gap-3 min-w-0">
              {currentMember.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentMember.avatar}
                  alt={currentMember.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center border-2 border-primary/30 shrink-0">
                  {currentMember.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground truncate">
                  {currentMember.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentMember.relation} • {currentMember.role}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Login with Phone</span>
          </Link>
        )}

        {/* Member Switcher (Only if multiple members are registered) */}
        {members.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] text-muted-foreground shrink-0 font-medium">Switch:</span>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => switchMember(m.id)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                  currentMember?.id === m.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
