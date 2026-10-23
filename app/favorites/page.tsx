"use client";

import React, { useMemo, useState } from "react";
import { Heart, Filter } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { PhotoGrid } from "@/components/photos/PhotoGrid";

export default function FavoritesPage() {
  const { activePhotos } = useVault();
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const favoritePhotos = useMemo(() => {
    return activePhotos.filter((p) => {
      if (!p.isFavorite) return false;
      if (selectedYear !== "all") {
        const year = new Date(p.takenAt || p.uploadedAt).getFullYear().toString();
        if (year !== selectedYear) return false;
      }
      return true;
    });
  }, [activePhotos, selectedYear]);

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    activePhotos
      .filter((p) => p.isFavorite)
      .forEach((p) => {
        years.add(new Date(p.takenAt || p.uploadedAt).getFullYear().toString());
      });
    return Array.from(years).sort().reverse();
  }, [activePhotos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Favorite Moments
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
            Cherished family highlights starred by you and your family.
          </p>
        </div>

        {availableYears.length > 1 && (
          <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground ml-2" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="touch-target px-3 py-1.5 rounded-xl bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <PhotoGrid
        photos={favoritePhotos}
        emptyTitle="No favorite photos yet"
        emptyDescription="Tap the heart icon on any photo in your timeline to add it to this special collection!"
      />
    </div>
  );
}
