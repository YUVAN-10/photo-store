"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
  Trash2,
  FolderPlus,
  ZoomIn,
  ZoomOut,
  Calendar,
  User,
  ShieldAlert,
} from "lucide-react";
import { Photo } from "@/lib/types";
import { useVault } from "@/lib/vault-context";
import { formatDate, formatBytes } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PhotoViewerModalProps {
  photo: Photo | null;
  allPhotos: Photo[];
  onClose: () => void;
  onSelectPhoto: (photo: Photo) => void;
}

export function PhotoViewerModal({
  photo,
  allPhotos,
  onClose,
  onSelectPhoto,
}: PhotoViewerModalProps) {
  const { toggleFavorite, deletePhoto, currentMember, albums, addPhotoToAlbum } = useVault();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showAddToAlbum, setShowAddToAlbum] = useState<boolean>(false);

  // Reset zoom on photo change
  useEffect(() => {
    setZoomLevel(1);
  }, [photo?.id]);

  const currentIndex = photo ? allPhotos.findIndex((p) => p.id === photo.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allPhotos.length - 1;

  const handlePrev = React.useCallback(() => {
    if (currentIndex > 0) onSelectPhoto(allPhotos[currentIndex - 1]);
  }, [currentIndex, allPhotos, onSelectPhoto]);

  const handleNext = React.useCallback(() => {
    if (currentIndex >= 0 && currentIndex < allPhotos.length - 1) {
      onSelectPhoto(allPhotos[currentIndex + 1]);
    }
  }, [currentIndex, allPhotos, onSelectPhoto]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!photo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, onClose, handlePrev, handleNext]);

  if (!photo) return null;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.5, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.5, 1));

  // Permissions: Only uploader or admin can delete
  const canDelete =
    currentMember?.role === "admin" || currentMember?.id === photo.uploaderId;

  const handleConfirmDelete = () => {
    deletePhoto(photo.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `familyvault-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/95 text-white flex flex-col justify-between select-none">
        {/* Top Controls Bar */}
        <div className="p-4 sm:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="touch-target p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label="Close photo viewer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <p className="font-semibold text-sm text-white/90 truncate max-w-xs">
                {photo.caption || "Family Photo"}
              </p>
              <p className="text-xs text-white/60">
                {currentIndex + 1} of {allPhotos.length}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="touch-target p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="touch-target p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => toggleFavorite(photo.id)}
              className="touch-target p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title={photo.isFavorite ? "Remove favorite" : "Add to favorites"}
              aria-label="Favorite toggle"
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  photo.isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
                }`}
              />
            </button>
            <button
              onClick={() => setShowAddToAlbum(true)}
              className="touch-target p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Add to Album"
              aria-label="Add to album"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="touch-target p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Download original photo"
              aria-label="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="touch-target p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
                title="Move to trash"
                aria-label="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Central Image Viewport */}
        <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
          {hasPrev && (
            <button
              onClick={handlePrev}
              className="touch-target absolute left-3 sm:left-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-transform hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <div
            className="transition-transform duration-200 ease-out max-h-full max-w-full flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption}
              className="max-h-[75vh] sm:max-h-[82vh] w-auto object-contain rounded-2xl shadow-2xl pointer-events-auto"
            />
          </div>

          {hasNext && (
            <button
              onClick={handleNext}
              className="touch-target absolute right-3 sm:right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-transform hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}
        </div>

        {/* Bottom Metadata Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-white/80">
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              {photo.caption || "Family Memory"}
            </h3>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-white/70">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Taken {formatDate(photo.takenAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-secondary" />
                Uploaded by {photo.uploaderName} ({photo.uploaderRelation})
              </span>
              <span>{formatBytes(photo.sizeBytes)} • WebP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Move to Trash?"
        description="Photos in trash are kept safely for 30 days before permanent deletion. You can restore them anytime."
      >
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm mb-6">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Local phone photos are never touched or modified.</span>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            Keep Photo
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Move to Trash
          </Button>
        </div>
      </Modal>

      {/* Add To Album Modal */}
      <Modal
        isOpen={showAddToAlbum}
        onClose={() => setShowAddToAlbum(false)}
        title="Add to Album"
        description="Select an album for this photo. Photos can belong to multiple albums without duplicating files."
      >
        <div className="space-y-2 py-2 max-h-60 overflow-y-auto">
          {albums.map((album) => {
            const isAlreadyIn = photo.albumIds.includes(album.id);
            return (
              <button
                key={album.id}
                onClick={() => {
                  addPhotoToAlbum(photo.id, album.id);
                  setShowAddToAlbum(false);
                }}
                disabled={isAlreadyIn}
                className={`w-full p-3 rounded-2xl text-left flex items-center justify-between border transition-all ${
                  isAlreadyIn
                    ? "bg-muted/40 border-border opacity-60 cursor-default"
                    : "bg-surface hover:bg-muted/50 border-border hover:border-primary"
                }`}
              >
                <div>
                  <div className="font-semibold text-foreground text-sm">{album.name}</div>
                  <div className="text-xs text-muted-foreground">{album.photoCount} photos</div>
                </div>
                {isAlreadyIn && (
                  <span className="text-xs text-secondary font-semibold">Already added</span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
