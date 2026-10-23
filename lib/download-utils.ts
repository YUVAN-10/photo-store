import { Photo } from "./types";
import { formatDate } from "./utils";

/**
 * Downloads an image file to the user's phone or computer gallery
 */
export async function downloadPhotoFile(photo: Photo): Promise<boolean> {
  const cleanName = (photo.caption || "family-photo")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `FamilyVault_${cleanName}.jpg`;

  try {
    const res = await fetch(photo.url, { mode: "cors" });
    if (!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch (err) {
    // Fallback: direct anchor download
    const a = document.createElement("a");
    a.href = photo.url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}

/**
 * Generates an exclusive, high-resolution Family Keepsake Polaroid Card
 */
export function generateKeepsakeCard(photo: Photo): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cardWidth = 1000;
      const cardHeight = 1250;
      const canvas = document.createElement("canvas");
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(photo.url);
        return;
      }

      // Background - Warm luxury card paper
      ctx.fillStyle = "#FAF8F5";
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Subtle textured border
      ctx.strokeStyle = "#EADFCF";
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, cardWidth - 40, cardHeight - 40);

      // Top Header Accent
      ctx.fillStyle = "#E25B36";
      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FAMILYVAULT • SPECIAL MEMORY", cardWidth / 2, 75);

      // Photo Frame area
      const photoX = 60;
      const photoY = 110;
      const photoW = cardWidth - 120; // 880
      const photoH = 880;

      // Dark frame border
      ctx.fillStyle = "#1E1C1A";
      ctx.fillRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);

      // Draw photo with cover aspect ratio
      const imgAspect = img.width / img.height;
      const targetAspect = photoW / photoH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgAspect > targetAspect) {
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoW, photoH);

      // Golden souvenir badge in corner of photo
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.roundRect(photoX + 20, photoY + photoH - 60, 260, 42, 21);
      ctx.fill();

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("✨ Family Keepsake", photoX + 42, photoY + photoH - 32);

      // Bottom Polaroid caption section
      const captionText = photo.caption || "Special Family Moment";
      ctx.fillStyle = "#26211E";
      ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(captionText, cardWidth / 2, 1060);

      // Date and Uploader details
      const dateText = formatDate(photo.takenAt || photo.uploadedAt);
      const uploaderText = photo.uploaderName ? `Captured by ${photo.uploaderName}` : "Family Member";

      ctx.fillStyle = "#786F66";
      ctx.font = "500 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`📅 ${dateText}  •  ❤️ ${uploaderText}`, cardWidth / 2, 1115);

      // Heartfelt family quote footer
      ctx.fillStyle = "#A89F95";
      ctx.font = "italic 22px Georgia, serif";
      ctx.fillText('"Family is where love begins and memories live forever."', cardWidth / 2, 1180);

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };

    img.onerror = () => {
      // Fallback
      resolve(photo.url);
    };

    img.src = photo.url;
  });
}
