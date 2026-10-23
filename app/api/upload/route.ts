import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Sanitize filename
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}_${cleanName}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Try to cache locally if filesystem is writable (e.g. local machine)
    // Serverless platforms like Vercel have a read-only filesystem (/var/task),
    // so we safely catch and ignore EROFS errors.
    try {
      const photosDir = path.join(process.cwd(), "photos");
      if (!fs.existsSync(photosDir)) {
        fs.mkdirSync(photosDir, { recursive: true });
      }
      const localFilePath = path.join(photosDir, filename);
      fs.writeFileSync(localFilePath, buffer);
    } catch (fsErr: any) {
      // Read-only filesystem (Vercel / Lambda) - continue to GitHub storage
      console.warn("Read-only filesystem, skipping local disk write:", fsErr?.message || fsErr);
    }

    // 2. Upload to GitHub repository from the server using secure backend token
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

    if (token) {
      const base64 = buffer.toString("base64");
      const ghRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/photos/${encodeURIComponent(filename)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "FamilyVault-App",
          },
          body: JSON.stringify({
            message: `Upload photo ${cleanName}`,
            content: base64,
            branch,
          }),
        }
      );

      if (!ghRes.ok) {
        const ghErr = await ghRes.json().catch(() => ({}));
        console.error("GitHub upload API error:", ghErr);
        throw new Error(ghErr.message || `GitHub storage error: ${ghRes.statusText}`);
      }
    } else {
      throw new Error("Missing GitHub storage credentials");
    }

    const photoUrl = `/api/photos/${encodeURIComponent(filename)}`;

    return NextResponse.json({
      success: true,
      filename,
      url: photoUrl,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
