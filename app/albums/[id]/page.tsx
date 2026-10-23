"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderHeart,
  Edit3,
  Trash2,
  Plus,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const albumId = resolvedParams.id;
  const router = useRouter();
  const { albums, activePhotos, deleteAlbum } = useVault();

  const album = albums.find((a) => a.id === albumId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!album) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Album not found</h2>
        <p className="text-muted-foreground">This album may have been deleted.</p>
        <Link href="/albums">
          <Button variant="outline">Back to Albums</Button>
        </Link>
      </div>
    );
  }

  // Filter photos belonging to this album
  const albumPhotos = activePhotos.filter((p) => p.albumIds.includes(album.id));

  const handleDeleteAlbum = () => {
    deleteAlbum(album.id);
    router.push("/albums");
  };

  return (
    <div className="space-y-6">
      {/* Top back button & controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/albums"
          className="touch-target inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>All Albums</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/upload">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Add Photos</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 hover:bg-red-500/10 p-2"
            title="Delete Album"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Album Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-warm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <FolderHeart className="w-4 h-4" />
          <span>Album</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {album.name}
        </h1>
        {album.description && (
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            {album.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <span>{albumPhotos.length} {albumPhotos.length === 1 ? "photo" : "photos"}</span>
          <span>•</span>
          <span>Zero file duplication</span>
        </div>
      </div>

      {/* Photos in this Album */}
      <PhotoGrid
        photos={albumPhotos}
        emptyTitle="No photos in this album yet"
        emptyDescription="Add photos to this album from your timeline or upload new ones!"
      />

      {/* Delete Album Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete this album?"
        description={`Are you sure you want to delete "${album.name}"?`}
      >
        <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-foreground text-sm flex items-start gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <span>
            <strong>Safe Deletion</strong>: Only the album folder is removed. The photos themselves remain completely safe in your FamilyVault timeline.
          </span>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Keep Album
          </Button>
          <Button variant="danger" onClick={handleDeleteAlbum}>
            Delete Album
          </Button>
        </div>
      </Modal>
    </div>
  );
}
