"use client";

import React from "react";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { Photo } from "@/lib/types";

interface MemoryCardProps {
  photos: Photo[];
  onOpenPhoto: (photo: Photo) => void;
}

export function MemoryCard({ photos, onOpenPhoto }: MemoryCardProps) {
  // Check if any photos were taken on today's month/day from earlier years
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();

  const memories = photos.filter((p) => {
    if (p.deletedAt) return false;
    const d = new Date(p.takenAt);
    return (
      d.getMonth() === currentMonth &&
      d.getDate() === currentDay &&
      d.getFullYear() < currentYear
    );
  });

  if (memories.length === 0) return null;

  const firstMemory = memories[0];
  const memoryDate = new Date(firstMemory.takenAt);
  const yearsAgo = currentYear - memoryDate.getFullYear();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-surface to-secondary/20 p-5 sm:p-6 border border-primary/30 shadow-warm my-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>On This Day • {yearsAgo} {yearsAgo === 1 ? "Year" : "Years"} Ago</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground pt-1">
            Cherished Moments from {memoryDate.getFullYear()}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            {memories.length} {memories.length === 1 ? "memory" : "memories"} saved from this day
          </p>
        </div>

        {/* Preview Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {memories.slice(0, 3).map((mem) => (
            <button
              key={mem.id}
              onClick={() => onOpenPhoto(mem)}
              className="touch-target relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-surface shadow-md hover:scale-105 transition-transform shrink-0"
              title={`View memory: ${mem.caption}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mem.thumbUrl || mem.url}
                alt={mem.caption}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {memories.length > 1 && (
            <button
              onClick={() => onOpenPhoto(firstMemory)}
              className="touch-target flex items-center gap-1 text-xs font-bold text-primary hover:underline px-2 shrink-0"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
