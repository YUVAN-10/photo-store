# FamilyVault 📸

**FamilyVault** is a warm, private, mobile-first Family Photo Storage Progressive Web Application (PWA) designed specifically for 5–15 family members, including parents and grandparents with zero technical knowledge.

> **Phase 1 Status**: This project is in **Phase 1 (Complete Frontend & Demo Mode)**. All user interfaces, photo browsing, simulated uploads, device-approval flow, family member settings, and albums are fully functional using verified demo data. **No production database or cloud bucket is required or connected.**

---

## 🌟 Core Principles

1. **Feels as simple as a phone gallery**: Large readable text, 48px+ touch targets, no complicated tech jargon.
2. **Passwordless & Simple Access**: Approved phone number identification without confusing OTPs or email links. Unapproved devices trigger an administrator review screen.
3. **Warm & Accessible Visual Design**:
   - Light Theme: Warm cream background (`#F8F4EC`), Terracotta accent (`#C87558`), Sage green secondary (`#82947A`), Deep brown text (`#493B32`).
   - Dark Theme: Deep warm charcoal (`#211F1B`), Soft terracotta (`#DE967A`), Sage (`#A5B79A`).
4. **Zero Cloud Duplicates & Privacy First**: SHA-256 deduplication, automatic client-side GPS/EXIF stripping, and private signed URLs for photos.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.17+ or 20+ (Node v22+ supported)
- npm 9+

### 2. Installation
```bash
git clone <repo-url>
cd photo-store
npm install
```

### 3. Environment Setup
Copy the template configuration:
```bash
cp .env.example .env.local
```
For Phase 1, `NEXT_PUBLIC_DEMO_MODE=true` is enabled by default. No external credentials are required to test the complete user experience!

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser (or your phone on the local Wi-Fi network).

### 5. Verification Commands
- `npm run lint`: Run ESLint checks.
- `npm run type-check`: Run TypeScript strict type verification.
- `npm run build`: Compile the Next.js production build.

---

## 📱 Navigation & Key Features (Phase 1)

| Section | Description |
|---|---|
| **Photos** (`/photos`) | Monthly timeline, lazy thumbnails, storage gauge (10 GB budget), uploader filter, search, and On This Day memory cards. |
| **Albums** (`/albums`) | Folder-styled albums (Family, Birthday, Trips, Festivals, etc.), create/edit albums, photo counts. |
| **Upload** (`/upload`) | Mobile-first drag-and-drop / file picker, multi-photo preview, album tagger, simulated client compression & SHA-256 deduplication check, progress tracking. |
| **Favorites** (`/favorites`) | Quick access to starred family moments with year and member filters. |
| **Family** (`/family`) | Family member list with friendly avatars (Amma, Appa, Paati, Thatha, Alice), admin device approvals, per-member storage breakdown, audit log, and backup export preview. |
| **Photo Viewer** | Fullscreen lightbox with zoom, swipe simulation, download, favorite toggle, caption viewer, and safe delete dialog. |
| **Trash** (`/trash`) | 30-day soft-delete retention bin with single-click restore or permanent delete. |

---

## 🔒 Production Architecture & Security Roadmap (Phases 2–6)

### Supabase Setup (Phase 3)
1. PostgreSQL with Row Level Security (RLS) enabled on all tables (`families`, `profiles`, `family_memberships`, `photos`, `albums`, `album_photos`, `pending_uploads`, `audit_logs`).
2. Server-side session authentication validating family workspace IDs and device approvals.

### Private Cloudflare R2 Storage (Phase 4)
- **Bucket Visibility**: Completely private. No public bucket URLs.
- **Upload Flow**: Browser calculates SHA-256 -> calls Next.js API `/api/photos/presign-upload` -> server verifies membership & issues 120s presigned PUT URL -> browser uploads directly to R2 -> browser confirms final size/hash with `/api/photos/verify`.
- **Viewing**: Server generates 300s presigned GET URLs on-demand for authenticated family members.

#### Cloudflare R2 CORS Configuration:
```json
[
  {
    "AllowedOrigins": ["https://your-domain.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 📦 Backup, Export & Restore Plan
- **Backup Export**: Administrators can download a complete ZIP bundle containing original photos along with `metadata.json` describing albums, captions, and dates.
- **Restore Procedure**: Re-importing `metadata.json` reconstructs the database catalog against the storage bucket keys without data loss.

---

## ⚠️ Free-Tier Budget & Storage Limits
- Family budget limit: **10 GB total application storage**.
- Maximum raw image size: 25 MB.
- WebP compression targets ~0.82 quality, longest side 2560px, thumbnails 400px.
- GPS and sensitive EXIF metadata stripped in-browser prior to upload.
