"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  ShieldCheck,
  UserCheck,
  LogIn,
  Trash2,
  LogOut,
  Users,
  ChevronDown,
} from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { ThemeToggle } from "./ThemeToggle";
import { StorageBar } from "./StorageBar";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentMember, members, switchMember, logout } = useVault();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-border px-3 sm:px-6 py-2.5 sm:py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo (visible on mobile where sidebar is hidden) */}
        <div className="flex items-center gap-2 sm:gap-3 md:hidden">
          <Link href="/photos" className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-warm shadow-primary/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground block leading-tight">
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          <StorageBar compact />

          {/* Mobile Trash Button (Always accessible on mobile) */}
          <Link
            href="/trash"
            className={`md:hidden touch-target p-2 rounded-xl transition-all flex items-center justify-center ${
              pathname === "/trash"
                ? "bg-primary text-white shadow-warm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title="Trash Bin"
            aria-label="Trash Bin"
          >
            <Trash2 className="w-5 h-5" />
          </Link>

          {/* Quick Member switcher pill & mobile menu */}
          {currentMember ? (
            <div className="relative md:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="touch-target flex items-center gap-1.5 p-1 rounded-full bg-muted/80 hover:bg-muted text-xs font-semibold text-foreground pr-2.5 border border-border/60 transition-all"
                title="Account Menu"
                aria-label="Account Menu"
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
                <span className="max-w-[65px] truncate">{currentMember.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mobile Touch Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl shadow-2xl border border-border p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  {/* Current Member Info */}
                  <div className="p-2 border-b border-border/70 mb-1">
                    <p className="font-extrabold text-sm text-foreground truncate">{currentMember.name}</p>
                    <p className="text-xs text-muted-foreground">{currentMember.relation} • {currentMember.role}</p>
                  </div>

                  {/* Navigation Links in Mobile Menu */}
                  <div className="space-y-0.5 py-1">
                    <Link
                      href="/trash"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        pathname === "/trash" ? "bg-primary text-white" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Trash2 className="w-4 h-4 text-primary" />
                      <span>Trash Bin (30-day safe)</span>
                    </Link>

                    <Link
                      href="/family"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        pathname === "/family" ? "bg-primary text-white" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Users className="w-4 h-4 text-secondary" />
                      <span>Family &amp; Access</span>
                    </Link>
                  </div>

                  {/* Member Switcher (if multiple members) */}
                  {members.length > 1 && (
                    <div className="border-t border-border/70 pt-2 mt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-primary" /> Switch Member
                      </div>
                      <div className="space-y-0.5 max-h-36 overflow-y-auto">
                        {members.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              switchMember(m.id);
                              setMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                              currentMember.id === m.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span className="truncate">{m.name} ({m.relation})</span>
                            {currentMember.id === m.id && <span className="text-[10px] text-primary">Active</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Logout Button */}
                  <div className="border-t border-border/70 pt-1.5 mt-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="md:hidden touch-target px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Quick One-Tap Mobile Logout Button (Visible directly on header when logged in) */}
          {currentMember && (
            <button
              onClick={handleLogout}
              className="md:hidden touch-target p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors flex items-center justify-center"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
