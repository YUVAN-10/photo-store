"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Heart,
  FolderPlus,
  Trash2,
  Download,
  Upload,
  Calendar,
  X,
} from "lucide-react";
import { Photo } from "@/lib/types";
import { PhotoCard } from "./PhotoCard";
import { PhotoViewerModal } from "./PhotoViewerModal";
import { DownloadCelebrationModal } from "./DownloadCelebrationModal";
import { formatMonthYear } from "@/lib/utils";
import { downloadPhotoFile } from "@/lib/download-utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useVault } from "@/lib/vault-context";
import Link from "next/link";

interface PhotoGridProps {
  photos: Photo[];
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function PhotoGrid({
  photos,
  title,
  emptyTitle = "No photos here yet",
  emptyDescription = "Tap the big plus button to add your favorite family photos!",
}: PhotoGridProps) {
  const { currentMember, albums, addPhotoToAlbum, toggleFavorite, deletePhoto } = useVault();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [celebrationPhoto, setCelebrationPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploaderFilter, setUploaderFilter] = useState<string>("all");
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkAlbumModal, setShowBulkAlbumModal] = useState<boolean>(false);

  const handleDownloadPhoto = async (photo: Photo) => {
    await downloadPhotoFile(photo);
    setCelebrationPhoto(photo);
  };

  // Available uploaders for filter
  const uploaders = useMemo(() => {
    const map = new Map<string, string>();
    photos.forEach((p) => map.set(p.uploaderId, p.uploaderName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchUploader =
        uploaderFilter === "all" || p.uploaderId === uploaderFilter;

      return matchSearch && matchUploader;
    });
  }, [photos, searchQuery, uploaderFilter]);

  // Group by Month & Year (using capture date, fallback upload date)
  const groupedPhotos = useMemo(() => {
    const groups: { [key: string]: Photo[] } = {};

    filteredPhotos.forEach((photo) => {
      const dateKey = formatMonthYear(photo.takenAt || photo.uploadedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(photo);
    });

    return groups;
  }, [filteredPhotos]);

  // Selection toggles
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map((p) => p.id));
    }
  };

  // Bulk actions
  const handleBulkFavorite = () => {
    selectedIds.forEach((id) => toggleFavorite(id));
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleBulkDelete = () => {
    if (confirm(`Move ${selectedIds.length} photos to 30-day trash?`)) {
      selectedIds.forEach((id) => deletePhoto(id));
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  const handleBulkDownload = () => {
    alert(`Downloading ${selectedIds.length} photos in an archive zip...`);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleBulkAddToAlbum = (albumId: string) => {
    selectedIds.forEach((id) => addPhotoToAlbum(id, albumId));
    setShowBulkAlbumModal(false);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Header controls: Search & Filter (Only when photos exist) */}
      {photos.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search family memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="touch-target w-full pl-12 pr-10 py-3 rounded-2xl bg-surface border border-border text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Uploader Filter Dropdown */}
            {uploaders.length > 1 && (
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={uploaderFilter}
                  onChange={(e) => setUploaderFilter(e.target.value)}
                  className="touch-target w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-surface border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                >
                  <option value="all">All Family Members</option>
                  {uploaders.map((u) => (
                    <option key={u.id} value={u.id}>
                      Uploaded by {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bulk Selection Mode Toggle */}
            <Button
              variant={isSelectionMode ? "secondary" : "outline"}
              size="md"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className="shrink-0"
            >
              {isSelectionMode ? "Cancel" : "Select"}
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Bar (Visible when in selection mode) */}
      {isSelectionMode && (
        <div className="sticky top-20 z-30 p-4 rounded-3xl bg-surface border border-primary/40 shadow-warm-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
            >
              {selectedIds.length === filteredPhotos.length ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground" />
              )}
              <span>
                {selectedIds.length === 0
                  ? "Select All"
                  : `${selectedIds.length} Selected`}
              </span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkFavorite}
                className="gap-1.5"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Favorite</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkAlbumModal(true)}
                className="gap-1.5"
              >
                <FolderPlus className="w-4 h-4 text-secondary" />
                <span>Add to Album</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                className="gap-1.5"
              >
                <Download className="w-4 h-4 text-primary" />
                <span>Download ZIP</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                className="gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-16 px-4 bg-surface rounded-3xl border border-border shadow-warm my-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {emptyTitle}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto text-base mb-6">
            {emptyDescription}
          </p>
          <Link href="/upload">
            <Button size="lg" className="shadow-md">
              <Upload className="w-5 h-5 mr-2" />
              Upload First Photo
            </Button>
          </Link>
        </div>
      )}

      {/* Grouped Timeline Display */}
      {Object.entries(groupedPhotos).map(([monthYear, group]) => (
        <section key={monthYear} className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span>{monthYear}</span>
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {group.length} {group.length === 1 ? "photo" : "photos"}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {group.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => setSelectedPhoto(photo)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.includes(photo.id)}
                onToggleSelect={() => handleToggleSelect(photo.id)}
                onDownload={handleDownloadPhoto}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Full-Screen Lightbox Modal */}
      {selectedPhoto && (
        <PhotoViewerModal
          photo={selectedPhoto}
          allPhotos={filteredPhotos}
          onClose={() => setSelectedPhoto(null)}
          onSelectPhoto={(p) => setSelectedPhoto(p)}
        />
      )}

      {/* Keepsake Celebration Modal */}
      <DownloadCelebrationModal
        photo={celebrationPhoto}
        isOpen={!!celebrationPhoto}
        onClose={() => setCelebrationPhoto(null)}
      />

      {/* Bulk Add to Album Modal */}
      <Modal
        isOpen={showBulkAlbumModal}
        onClose={() => setShowBulkAlbumModal(false)}
        title="Add Selected Photos to Album"
        description={`Adding ${selectedIds.length} photos. Files will not be duplicated.`}
      >
        <div className="space-y-2 py-3 max-h-60 overflow-y-auto">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => handleBulkAddToAlbum(album.id)}
              className="w-full p-3.5 rounded-2xl text-left flex items-center justify-between border border-border bg-surface hover:bg-muted/50 hover:border-primary transition-all"
            >
              <div>
                <div className="font-bold text-foreground text-base">{album.name}</div>
                <div className="text-xs text-muted-foreground">{album.photoCount} photos</div>
              </div>
              <span className="text-xs font-bold text-primary">Select</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
