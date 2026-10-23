"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, RotateCcw, AlertTriangle, ShieldCheck, ArrowLeft } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function TrashPage() {
  const { trashPhotos, restorePhoto, permanentlyDeletePhoto } = useVault();
  const [photoToPurge, setPhotoToPurge] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/photos"
          className="touch-target inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Photos</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-warm space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Trash2 className="w-5 h-5" />
          <span>30-Day Trash Bin</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Recently Deleted Photos
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
          Photos stay here for 30 days before permanent deletion. If you deleted a photo by mistake, you can restore it with a single tap.
        </p>
      </div>

      {trashPhotos.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-3xl border border-border text-muted-foreground">
          <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-secondary" />
          <p className="text-lg font-bold text-foreground">Trash bin is empty</p>
          <p className="text-sm mt-1">No deleted photos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trashPhotos.map((photo) => (
            <div
              key={photo.id}
              className="p-4 rounded-3xl bg-surface border border-border shadow-warm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted/50 border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbUrl || photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover grayscale opacity-75"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm truncate">
                    {photo.caption || "Deleted Photo"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Deleted on {photo.deletedAt ? formatDate(photo.deletedAt) : "Recently"} • {formatBytes(photo.sizeBytes)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restorePhoto(photo.id)}
                  className="gap-1.5 flex-1"
                >
                  <RotateCcw className="w-4 h-4 text-secondary" />
                  <span>Restore</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoToPurge(photo.id)}
                  className="text-red-500 hover:bg-red-500/10 p-2"
                  title="Permanently Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permanent Delete Modal */}
      <Modal
        isOpen={!!photoToPurge}
        onClose={() => setPhotoToPurge(null)}
        title="Permanently Delete Photo?"
        description="This action cannot be undone. The photo file will be completely wiped from Cloudflare R2 storage."
      >
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>This will permanently free up storage space.</span>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setPhotoToPurge(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (photoToPurge) permanentlyDeletePhoto(photoToPurge);
              setPhotoToPurge(null);
            }}
          >
            Permanently Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
