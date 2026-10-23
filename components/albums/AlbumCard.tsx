"use client";

import React from "react";
import Link from "next/link";
import { FolderHeart, Image as ImageIcon } from "lucide-react";
import { Album } from "@/lib/types";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/albums/${album.id}`}
      className="group block relative rounded-3xl bg-surface border border-border shadow-warm hover:shadow-warm-lg transition-all duration-200 overflow-hidden select-none hover:-translate-y-1"
    >
      {/* Folder Tab Shape Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/50">
        {album.coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={album.coverPhotoUrl}
            alt={album.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 stroke-1" />
          </div>
        )}

        {/* Count Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold shadow">
          {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
        </div>
      </div>

      {/* Album Info */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <FolderHeart className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors">
            {album.name}
          </h3>
        </div>
        {album.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {album.description}
          </p>
        )}
      </div>
    </Link>
  );
}
