"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Photo } from "@/lib/types";
import { X, Sparkles, Check, ArrowDownToLine } from "lucide-react";

interface DownloadSuccessToastProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadSuccessToast({
  photo,
  isOpen,
  onClose,
}: DownloadSuccessToastProps) {
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setIsExiting(false);
    // Auto-dismiss after 3.2 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 3200);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || !photo) return null;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const toastContent = (
    <aside
      aria-label="Download notification"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-md pointer-events-auto select-none"
    >
      <div
        className={`relative overflow-hidden backdrop-blur-2xl bg-[#18181b]/95 dark:bg-[#121214]/95 text-white rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/20 transition-all ${
          isExiting ? "animate-toast-out" : "animate-toast-in"
        }`}
      >
        {/* Subtle ambient gradient shimmer inside the card */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          {/* Animated Success Checkmark Ring */}
          <div className="relative shrink-0">
            {/* Glowing animated halo */}
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-md animate-pulse" />

            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40">
              <svg
                className="w-6 h-6 stroke-white stroke-[3.5] fill-none drop-shadow"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  className="animate-checkmark-draw"
                />
              </svg>
            </div>

            {/* Sparkle badge */}
            <div className="absolute -top-1.5 -right-1.5 text-amber-300 animate-sparkle-pop">
              <Sparkles className="w-4 h-4 fill-amber-300 drop-shadow" />
            </div>
          </div>

          {/* Photo Thumbnail Preview */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-inner bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbUrl || photo.url}
              alt={photo.caption || "Downloaded"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px]">
              <ArrowDownToLine className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Text Message */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight truncate">
                Photo Downloaded Successfully!
              </h4>
            </div>
            <p className="text-xs text-white/70 mt-0.5 truncate font-medium">
              Saved to your device in full quality
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="touch-target p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timed progress bar along bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-primary"
            style={{
              animation: "shrinkWidth 3.2s linear forwards",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </aside>
  );

  return createPortal(toastContent, document.body);
}
