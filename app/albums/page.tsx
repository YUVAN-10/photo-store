"use client";

import React, { useState } from "react";
import { FolderPlus, FolderHeart, Sparkles } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { AlbumCard } from "@/components/albums/AlbumCard";
import { CreateAlbumModal } from "@/components/albums/CreateAlbumModal";
import { Button } from "@/components/ui/Button";

export default function AlbumsPage() {
  const { albums } = useVault();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Family Albums
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
            Organize special trips, events, and family chapters.
          </p>
        </div>

        <Button
          size="md"
          onClick={() => setShowCreateModal(true)}
          className="gap-2 shrink-0 shadow-warm"
        >
          <FolderPlus className="w-5 h-5" />
          <span>New Album</span>
        </Button>
      </div>

      {/* Zero Duplicate Explainer Banner */}
      <div className="p-4 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center gap-3 text-xs sm:text-sm text-foreground">
        <Sparkles className="w-5 h-5 text-secondary shrink-0" />
        <p>
          <strong>Zero Storage Waste</strong>: Photos can be added to multiple albums without copying or re-uploading the file. Deleting an album never deletes your original photos.
        </p>
      </div>

      {/* Albums Grid or Empty State */}
      {albums.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-surface border-2 border-dashed border-border text-center space-y-4 shadow-warm my-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FolderHeart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">No Family Albums Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Create folder-styled albums for birthdays, trips, and special celebrations. Photos added to albums never duplicate image files!
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <FolderPlus className="w-4 h-4" />
            <span>Create Your First Album</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
