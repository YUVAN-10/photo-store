"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image as ImageIcon, FolderHeart, Plus, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Photos",
      href: "/photos",
      icon: ImageIcon,
    },
    {
      label: "Albums",
      href: "/albums",
      icon: FolderHeart,
    },
    {
      label: "Upload",
      href: "/upload",
      icon: Plus,
      isPrimary: true,
    },
    {
      label: "Favorites",
      href: "/favorites",
      icon: Heart,
    },
    {
      label: "Family",
      href: "/family",
      icon: Users,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-border px-3 py-2 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
                aria-label="Upload photos"
              >
                <div className="touch-target w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-warm-lg shadow-primary/30 group-hover:scale-105 group-active:scale-95 transition-all">
                  <Icon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-semibold text-primary mt-1">Upload</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "touch-target flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-colors",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
              <span className="text-[11px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
