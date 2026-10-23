import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatMonthYear(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export async function uploadToGitHub(file: File): Promise<string> {
  const token =
    process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
    process.env.GITHUB_TOKEN ||
    "";
  const owner =
    process.env.NEXT_PUBLIC_GITHUB_OWNER ||
    process.env.GITHUB_OWNER ||
    "YUVAN-10";
  const repo =
    process.env.NEXT_PUBLIC_GITHUB_REPO ||
    process.env.GITHUB_REPO ||
    "photo-store";
  const branch =
    process.env.NEXT_PUBLIC_GITHUB_BRANCH ||
    process.env.GITHUB_BRANCH ||
    "main";

  // Sanitize filename to avoid weird character issues in URLs
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}_${cleanName}`;
  const path = `photos/${filename}`;

  const buffer = await file.arrayBuffer();
  // Browser-friendly base64 encoding fallback
  let base64: string;
  if (typeof Buffer !== "undefined") {
    // Node environment (or polyfilled Buffer)
    base64 = Buffer.from(buffer).toString("base64");
  } else {
    // Browser environment
    const uint8 = new Uint8Array(buffer);
    let binary = "";
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    base64 = btoa(binary);
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/photos/${encodeURIComponent(filename)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload photo ${file.name}`,
        content: base64,
        branch,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub upload failed: ${err.message || res.statusText}`);
  }

  return `/api/photos/${encodeURIComponent(filename)}`;
}
