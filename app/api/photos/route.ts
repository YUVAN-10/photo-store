import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const photosDir = path.join(process.cwd(), "photos");
    const photos: Photo[] = [];

    // 1. Read from local photos directory if available
    try {
      if (fs.existsSync(photosDir)) {
        const files = fs.readdirSync(photosDir);
        for (const file of files) {
          if (file === ".keep" || file.startsWith(".")) continue;

          const filePath = path.join(photosDir, file);
          const stats = fs.statSync(filePath);

          let caption = file.replace(/\.[^/.]+$/, "");
          if (caption.includes("_")) {
            caption = caption.substring(caption.indexOf("_") + 1);
          }
          caption = caption.replace(/[-_]/g, " ");

          let takenAt = stats.mtime.toISOString();
          const timestampMatch = file.match(/^(\d{13})_/);
          if (timestampMatch) {
            const parsed = new Date(parseInt(timestampMatch[1]));
            if (!isNaN(parsed.getTime())) {
              takenAt = parsed.toISOString();
            }
          }

          photos.push({
            id: `ph-${file}`,
            familyId: "fam-vault",
            uploaderId: "mem-9965143222",
            uploaderName: "Yuvan",
            uploaderRelation: "Son (Admin)",
            url: `/api/photos/${encodeURIComponent(file)}`,
            thumbUrl: `/api/photos/${encodeURIComponent(file)}`,
            width: 2560,
            height: 1707,
            sizeBytes: stats.size,
            thumbSizeBytes: Math.floor(stats.size * 0.1),
            takenAt,
            uploadedAt: stats.mtime.toISOString(),
            caption: caption || "Family Memory",
            isFavorite: false,
            albumIds: [],
            hash: `hash-${file}`,
          });
        }
      }
    } catch (fsErr) {
      console.warn("Could not read local photos directory:", fsErr);
    }

    // 2. Also try fetching from GitHub repository contents if remote has more files
    const token =
      process.env.GITHUB_TOKEN ||
      process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
      "";
    const owner =
      process.env.GITHUB_OWNER ||
      process.env.NEXT_PUBLIC_GITHUB_OWNER ||
      "YUVAN-10";
    const repo =
      process.env.GITHUB_REPO ||
      process.env.NEXT_PUBLIC_GITHUB_REPO ||
      "photo-store";

    if (token) {
      try {
        const ghRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/photos`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "FamilyVault-App",
            },
            next: { revalidate: 0 },
          }
        );

        if (ghRes.ok) {
          const ghFiles = await ghRes.json();
          if (Array.isArray(ghFiles)) {
            for (const item of ghFiles) {
              if (item.type !== "file" || item.name === ".keep" || item.name.startsWith(".")) {
                continue;
              }

              const alreadyExists = photos.some(
                (p) => p.id === `ph-${item.name}` || p.url.includes(item.name)
              );

              if (!alreadyExists) {
                let caption = item.name.replace(/\.[^/.]+$/, "");
                if (caption.includes("_")) {
                  caption = caption.substring(caption.indexOf("_") + 1);
                }
                caption = caption.replace(/[-_]/g, " ");

                photos.push({
                  id: `ph-${item.name}`,
                  familyId: "fam-vault",
                  uploaderId: "mem-9965143222",
                  uploaderName: "Yuvan",
                  uploaderRelation: "Son (Admin)",
                  url: `/api/photos/${encodeURIComponent(item.name)}`,
                  thumbUrl: `/api/photos/${encodeURIComponent(item.name)}`,
                  width: 2560,
                  height: 1707,
                  sizeBytes: item.size || 250000,
                  thumbSizeBytes: Math.floor((item.size || 250000) * 0.1),
                  takenAt: new Date().toISOString(),
                  uploadedAt: new Date().toISOString(),
                  caption: caption || "Family Memory",
                  isFavorite: false,
                  albumIds: [],
                  hash: item.sha || item.name,
                });
              }
            }
          }
        }
      } catch (ghErr) {
        console.warn("GitHub fetch warning in /api/photos:", ghErr);
      }
    }

    photos.sort(
      (a, b) => new Date(b.takenAt || b.uploadedAt).getTime() - new Date(a.takenAt || a.uploadedAt).getTime()
    );

    return NextResponse.json({ success: true, photos });
  } catch (error: any) {
    console.error("Error in /api/photos GET:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load photos", photos: [] },
      { status: 500 }
    );
  }
}
