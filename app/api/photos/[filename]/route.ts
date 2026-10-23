import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);

    // Prevent directory traversal
    if (decodedFilename.includes("..") || decodedFilename.includes("/") || decodedFilename.includes("\\")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    const localPath = path.join(process.cwd(), "photos", decodedFilename);

    // 1. Check local filesystem first
    try {
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        const mimeType = getMimeType(decodedFilename);

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Length": fileBuffer.length.toString(),
          },
        });
      }
    } catch (fsErr) {
      console.warn("Could not read local photo file:", fsErr);
    }

    // 2. Fallback to GitHub raw content via server proxy (bypasses ISP blocks in India)
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
    const branch =
      process.env.GITHUB_BRANCH ||
      process.env.NEXT_PUBLIC_GITHUB_BRANCH ||
      "main";

    const ghUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/photos/${encodeURIComponent(decodedFilename)}`;
    const ghRes = await fetch(ghUrl, {
      headers: token ? { Authorization: `token ${token}` } : {},
    });

    if (ghRes.ok) {
      const buffer = await ghRes.arrayBuffer();
      const mimeType = getMimeType(decodedFilename);

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("Photo not found", { status: 404 });
  } catch (error: any) {
    console.error("Error serving photo:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
