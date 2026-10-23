"use client";

import React, { useState } from "react";
import { HardDrive, AlertTriangle, Info } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { formatBytes } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export function StorageBar({ compact = false }: { compact?: boolean }) {
  const { totalStorageBytes, maxStorageBudgetBytes, storageUsagePercent, photos } = useVault();
  const [showDetails, setShowDetails] = useState(false);

  // Breakdown
  const fullImageBytes = photos
    .filter((p) => !p.deletedAt)
    .reduce((sum, p) => sum + p.sizeBytes, 0);
  const thumbBytes = photos
    .filter((p) => !p.deletedAt)
    .reduce((sum, p) => sum + p.thumbSizeBytes, 0);
  const remainingBytes = Math.max(0, maxStorageBudgetBytes - totalStorageBytes);
  const isWarning = storageUsagePercent >= 80;

  if (compact) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-xs font-medium text-foreground/80 transition-colors"
        title="View family storage usage"
      >
        <HardDrive className="w-3.5 h-3.5 text-primary" />
        <span>{formatBytes(totalStorageBytes)} / 10 GB</span>
        {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
      </button>
    );
  }

  return (
    <>
      <div className="bg-surface rounded-3xl p-5 border border-border shadow-warm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm sm:text-base">
                Family Storage
              </h4>
              <p className="text-xs text-muted-foreground">
                {formatBytes(totalStorageBytes)} used of 10 GB total limit
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(true)}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden my-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isWarning ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${Math.max(2, storageUsagePercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{storageUsagePercent.toFixed(1)}% consumed</span>
          <span>{formatBytes(remainingBytes)} remaining</span>
        </div>

        {isWarning && (
          <div className="mt-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Storage is over 80% full. Consider removing older photos to free up space.</span>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Family Storage Breakdown"
        description="Private Cloudflare R2 budget (10 GB application limit)"
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="text-muted-foreground text-xs font-medium">Full Photos</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {formatBytes(fullImageBytes)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Optimized WebP (max 2560px)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="text-muted-foreground text-xs font-medium">Thumbnails</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {formatBytes(thumbBytes)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Fast previews (400px)
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Storage Used:</span>
              <span className="font-semibold text-foreground">{formatBytes(totalStorageBytes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Free Space Remaining:</span>
              <span className="font-semibold text-secondary">{formatBytes(remainingBytes)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Total Budget Limit:</span>
              <span className="font-bold text-foreground">10.0 GB</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground p-3 rounded-2xl bg-muted/30">
            💡 <strong>Automatic Space Savings</strong>: Every photo is compressed client-side to WebP quality 0.82 and deduplicated with SHA-256 before uploading to keep your family storage lean.
          </div>
        </div>
      </Modal>
    </>
  );
}
