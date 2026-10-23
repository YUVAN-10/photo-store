"use client";

import React from "react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Back Up Photos
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Select photos from your phone to share safely with the family.
        </p>
      </div>

      <UploadDropzone />
    </div>
  );
}
