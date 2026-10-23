"use client";

import React, { useState } from "react";
import { Heart, Check } from "lucide-react";
import { Photo } from "@/lib/types";
import { useVault } from "@/lib/vault-context";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function PhotoCard({
  photo,
  onClick,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}: PhotoCardProps) {
  const { toggleFavorite } = useVault();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={cn(
        "group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-muted/40 border border-border shadow-warm cursor-pointer transition-all duration-200 select-none",
        isSelected
          ? "ring-4 ring-primary ring-offset-2 scale-[0.98]"
          : "hover:shadow-warm-lg hover:scale-[1.01]"
      )}
      onClick={() => {
        if (isSelectionMode && onToggleSelect) {
          onToggleSelect();
        } else {
          onClick();
        }
      }}
    >
      {/* Skeleton placeholder while loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted/60 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.thumbUrl || photo.url}
        alt={photo.caption || "Family photo"}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Selection Checkbox (visible in selection mode or on hover) */}
      {isSelectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSelect) onToggleSelect();
          }}
          className={cn(
            "touch-target absolute top-2.5 left-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md",
            isSelected
              ? "bg-primary text-white"
              : "bg-black/40 text-white/80 hover:bg-black/60 border border-white/50"
          )}
          aria-label={isSelected ? "Deselect photo" : "Select photo"}
        >
          {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
        </button>
      )}

      {/* Favorite Button */}
      {!isSelectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(photo.id);
          }}
          className="touch-target absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-transform active:scale-125"
          aria-label={photo.isFavorite ? "Unfavorite photo" : "Favorite photo"}
          title={photo.isFavorite ? "Favorited" : "Add to favorites"}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              photo.isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
            )}
          />
        </button>
      )}

      {/* Hover/Tap Caption Gradient Bar */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
          {photo.caption || "Family photo"}
        </p>
        <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 truncate">
          by {photo.uploaderName}
        </p>
      </div>
    </div>
  );
}
