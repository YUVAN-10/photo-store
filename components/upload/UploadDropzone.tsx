"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  FolderPlus,
  ShieldCheck,
  Smartphone,
  X,
  FileCheck2,
} from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/utils";

export function UploadDropzone() {
  const { albums, simulateUpload, pendingUploads, clearFinishedUploads } = useVault();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setSelectedFiles((prev) => [...prev, ...list]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesChosen(e.dataTransfer.files);
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    await simulateUpload(selectedFiles, selectedAlbumId || undefined);
    setSelectedFiles([]);
    setIsProcessing(false);
  };

  const handleRemovePending = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const completedCount = pendingUploads.filter((u) => u.status === "verified").length;
  const duplicateCount = pendingUploads.filter((u) => u.status === "duplicate").length;
  const errorCount = pendingUploads.filter((u) => u.status === "error").length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilesChosen(e.target.files)}
      />

      {/* Album Selector (Optional) */}
      <div className="bg-surface p-4 sm:p-5 rounded-3xl border border-border shadow-warm">
        <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-primary" />
          <span>Add to Album (Optional)</span>
        </label>
        <select
          value={selectedAlbumId}
          onChange={(e) => setSelectedAlbumId(e.target.value)}
          className="touch-target w-full px-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
        >
          <option value="">No specific album (Timeline only)</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              📁 {a.name} ({a.photoCount} photos)
            </option>
          ))}
        </select>
      </div>

      {/* Main Drag-and-Drop / Native Picker Trigger */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-3 border-dashed cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/60 bg-surface/80 hover:bg-surface shadow-warm"
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
          <UploadCloud className="w-10 h-10" />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground text-center mb-2">
          Tap here to choose family photos
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground text-center max-w-sm mb-6">
          Opens your phone camera or gallery. You can select multiple photos at once.
        </p>

        <Button
          type="button"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="shadow-warm shadow-primary/20"
        >
          <Smartphone className="w-5 h-5 mr-2" />
          Open Phone Photos
        </Button>
      </div>

      {/* Selected Preview Staging List */}
      {selectedFiles.length > 0 && (
        <div className="bg-surface p-5 sm:p-6 rounded-3xl border border-border shadow-warm space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-base">
              Ready to Upload ({selectedFiles.length} photos)
            </h4>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-muted-foreground hover:text-red-500 font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
            {selectedFiles.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/40 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePending(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 text-white text-[9px] truncate text-center">
                    {formatBytes(file.size)}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full"
            isLoading={isProcessing}
            onClick={handleStartUpload}
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            Upload &amp; Protect Photos ({selectedFiles.length})
          </Button>
        </div>
      )}

      {/* Live Upload Progress & Completed Status */}
      {pendingUploads.length > 0 && (
        <div className="bg-surface p-5 sm:p-6 rounded-3xl border border-border shadow-warm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-base">
              Upload Progress &amp; Verification
            </h4>
            <button
              onClick={clearFinishedUploads}
              className="text-xs text-primary font-bold hover:underline"
            >
              Clear finished
            </button>
          </div>

          <div className="space-y-3">
            {pendingUploads.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-muted/30 border border-border space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-xs">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground">({formatBytes(item.file.size)})</span>
                  </div>
                  <div>
                    {item.status === "verified" && (
                      <span className="text-secondary font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Backed Up!
                      </span>
                    )}
                    {item.status === "duplicate" && (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5" /> Already in Vault
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                    {(item.status === "pending" ||
                      item.status === "compressing" ||
                      item.status === "uploading") && (
                      <span className="text-primary font-bold">{item.progress}%</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.status === "verified"
                        ? "bg-secondary"
                        : item.status === "duplicate"
                        ? "bg-amber-500"
                        : item.status === "error"
                        ? "bg-red-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                {item.errorMessage && (
                  <p className="text-[11px] text-muted-foreground">{item.errorMessage}</p>
                )}
              </div>
            ))}
          </div>

          {/* Completion summary message */}
          {completedCount > 0 && (
            <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 text-foreground text-sm flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-secondary shrink-0" />
              <div>
                <p className="font-bold">Your photos are safely backed up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verified with SHA-256 and stored safely. Your phone photos remain untouched.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Safety Notice for Family Members */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
        <span>
          <strong>Privacy Guarantee</strong>: GPS and location metadata are automatically stripped before uploading. Only family members can view your photos.
        </span>
      </div>
    </div>
  );
}
