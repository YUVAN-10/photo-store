"use client";

import React from "react";
import { useVault } from "@/lib/vault-context";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { MemoryCard } from "@/components/photos/MemoryCard";
import { PhotoViewerModal } from "@/components/photos/PhotoViewerModal";
import { Photo } from "@/lib/types";

export default function PhotosPage() {
  const { activePhotos } = useVault();
  const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Title & Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Family Photos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
            All your precious family moments, automatically organized.
          </p>
        </div>
      </div>

      {/* On This Day Nostalgic Flashback */}
      <MemoryCard
        photos={activePhotos}
        onOpenPhoto={(photo) => setSelectedPhoto(photo)}
      />

      {/* Timeline Photo Grid */}
      <PhotoGrid
        photos={activePhotos}
        emptyTitle="No family photos uploaded yet"
        emptyDescription="Your private family vault is waiting for its first memory. Tap the big plus button to upload!"
      />

      {/* Lightbox Modal for Memory Card clicks */}
      {selectedPhoto && (
        <PhotoViewerModal
          photo={selectedPhoto}
          allPhotos={activePhotos}
          onClose={() => setSelectedPhoto(null)}
          onSelectPhoto={(p) => setSelectedPhoto(p)}
        />
      )}
    </div>
  );
}
