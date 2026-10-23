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

      {/* Albums Grid or Empty State */}
      {albums.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-surface border-2 border-dashed border-border text-center space-y-4 shadow-warm my-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FolderHeart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">No Albums Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Create albums for family trips, birthdays, and celebrations.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <FolderPlus className="w-4 h-4" />
            <span>Create Your First Album</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
