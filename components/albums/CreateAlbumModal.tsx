"use client";

import React, { useState } from "react";
import { FolderPlus, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useVault } from "@/lib/vault-context";

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (albumId: string) => void;
}

const SUGGESTIONS = [
  "Family",
  "Birthday",
  "Wedding",
  "Trips",
  "Festivals",
  "Kids",
  "Favorites",
];

export function CreateAlbumModal({ isOpen, onClose, onCreated }: CreateAlbumModalProps) {
  const { createAlbum } = useVault();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAlbum = createAlbum(name.trim(), description.trim());
    setName("");
    setDescription("");
    onClose();
    if (onCreated) onCreated(newAlbum.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Album"
      description="Organize your photos like folders. A photo can be in multiple albums without taking up extra space!"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Suggested Album Ideas */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Popular Album Ideas:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setName(sug)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted hover:bg-primary hover:text-white transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Album Name */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-1">
            Album Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Summer Vacation 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="touch-target w-full px-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Album Description */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="What memories are in this album?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()} className="gap-2">
            <FolderPlus className="w-5 h-5" />
            Create Album
          </Button>
        </div>
      </form>
    </Modal>
  );
}
