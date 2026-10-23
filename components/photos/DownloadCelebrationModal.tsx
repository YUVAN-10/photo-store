"use client";

import React, { useState, useEffect } from "react";
import { Photo } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { generateKeepsakeCard } from "@/lib/download-utils";
import { Download, Sparkles, Share2, Check, Heart, Camera } from "lucide-react";

interface DownloadCelebrationModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadCelebrationModal({
  photo,
  isOpen,
  onClose,
}: DownloadCelebrationModalProps) {
  const [keepsakeUrl, setKeepsakeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasDownloadedCard, setHasDownloadedCard] = useState(false);

  useEffect(() => {
    if (photo && isOpen) {
      setIsGenerating(true);
      setHasDownloadedCard(false);
      generateKeepsakeCard(photo)
        .then((url) => setKeepsakeUrl(url))
        .catch(() => setKeepsakeUrl(null))
        .finally(() => setIsGenerating(false));
    } else {
      setKeepsakeUrl(null);
    }
  }, [photo, isOpen]);

  if (!photo) return null;

  const handleDownloadCard = () => {
    if (!keepsakeUrl) return;
    const cleanName = (photo.caption || "keepsake")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const a = document.createElement("a");
    a.href = keepsakeUrl;
    a.download = `FamilyVault_Keepsake_${cleanName}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setHasDownloadedCard(true);
  };

  const handleShare = async () => {
    const title = "FamilyVault Memory";
    const text = `Look at this family photo: "${photo.caption || 'Special Memory'}"!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: photo.url,
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      // WhatsApp Web or direct link fallback
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${text} ${photo.url}`
      )}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="relative overflow-hidden text-center space-y-5 py-2">
        {/* Animated Celebration Confetti background */}
        <div className="absolute -top-10 inset-x-0 flex justify-around pointer-events-none z-0">
          <span className="text-3xl animate-bounce delay-100">🎉</span>
          <span className="text-2xl animate-ping delay-200">✨</span>
          <span className="text-3xl animate-bounce delay-300">💖</span>
          <span className="text-2xl animate-spin delay-150">⭐</span>
          <span className="text-3xl animate-bounce delay-200">🎊</span>
        </div>

        {/* Celebration Header */}
        <div className="relative z-10 pt-2 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider animate-in fade-in-50 duration-300">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Photo Saved to Gallery!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            A Gift For Your Family 🎁
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            We created an exclusive <strong>Family Keepsake Polaroid Card</strong> for you to save or share with family!
          </p>
        </div>

        {/* Polaroid Card Preview */}
        <div className="relative z-10 flex justify-center py-1">
          {isGenerating ? (
            <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-2xl bg-muted/60 animate-pulse border-4 border-surface shadow-2xl flex flex-col items-center justify-center p-4 text-muted-foreground gap-3">
              <Camera className="w-10 h-10 animate-bounce text-primary" />
              <span className="text-xs font-semibold">Creating keepsake...</span>
            </div>
          ) : keepsakeUrl ? (
            <div className="relative group max-w-[260px] sm:max-w-[290px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 transform rotate-1 hover:rotate-0 transition-all duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={keepsakeUrl}
                alt="Family Keepsake Card"
                className="w-full h-auto object-contain select-none"
              />
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Polaroid Edition</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 space-y-2.5 pt-2">
          {/* Main Download Card Button */}
          <Button
            size="lg"
            onClick={handleDownloadCard}
            disabled={!keepsakeUrl || isGenerating}
            className="w-full text-base font-bold py-3.5 rounded-2xl bg-gradient-to-r from-primary via-rose-500 to-amber-500 hover:opacity-95 text-white shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-100 transition-all"
          >
            {hasDownloadedCard ? (
              <>
                <Check className="w-5 h-5 mr-2 stroke-[3]" />
                <span>Keepsake Card Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                <span>Download Family Keepsake Card</span>
              </>
            )}
          </Button>

          {/* Share with Family Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleShare}
              className="flex-1 rounded-2xl border-2 border-border hover:border-primary gap-2 text-foreground font-semibold"
            >
              <Share2 className="w-4 h-4 text-emerald-500" />
              <span>Share to WhatsApp / Family</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="rounded-2xl text-muted-foreground hover:text-foreground"
            >
              Done
            </Button>
          </div>
        </div>

        {/* Warm quote footer */}
        <p className="text-[11px] text-muted-foreground/80 italic pt-1">
          &ldquo;Preserving family moments with love and care.&rdquo;
        </p>
      </div>
    </Modal>
  );
}
