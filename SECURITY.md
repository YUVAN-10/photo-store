# FamilyVault Security Specification & Audit Guide

This document specifies the security policies, zero-trust backend mechanisms, and privacy guarantees for **FamilyVault**.

---

## 1. Access Control & Zero-Trust Architecture

- **Private Storage**: The Cloudflare R2 storage bucket has public access permanently disabled. Direct bucket URLs are blocked.
- **Server-Side Enforcement**: Client-side role claims are never trusted. All API requests authenticate via server-side session cookies or tokens verified against active Supabase `family_memberships`.
- **Row Level Security (RLS)**: Every database table enforces `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` with default `RESTRICTIVE` policies denying cross-family access.
- **Service Role Secrets**: The Supabase `SERVICE_ROLE_KEY` and R2 credentials are only accessible within Next.js Server Components and API route handlers. They are strictly excluded from client bundles.

---

## 2. Passwordless Phone & Device Authorization Model

To cater to elderly family members without compromising security:
1. **Registered Phone Numbers Only**: During initial family bootstrap, the administrator pre-registers family numbers (`allowed_phone_numbers`).
2. **Device Fingerprint & Pairing**:
   - When a family member enters their phone number on an authorized device, a device token stored in a secure, `HttpOnly` cookie validates the session.
   - If an unapproved device attempts access, the app transitions to a **Device Approval Pending** screen.
   - The family administrator must approve the new device from their admin dashboard before access is unlocked.
3. **Device Revocation**:
   - An administrator can instantly revoke any device session from the Family Management panel.
   - Revoked device tokens are immediately invalidated in `audit_logs` and rejected on subsequent API calls.

---

## 3. Image Privacy & GPS Metadata Stripping

1. **Client-Side EXIF / Geolocation Removal**:
   - Before any image binary is uploaded, the browser uses an HTML5 Canvas / Web Worker pipeline to read capture timestamps (`DateTimeOriginal`), and reconstructs the image clean of GPS coordinates (`GPSLatitude`, `GPSLongitude`), device serial numbers, or location headers.
2. **Deterministic Deduplication**:
   - SHA-256 hashes are computed client-side over the raw file binary.
   - If a duplicate image is detected within the family workspace, the upload is skipped with a clear, friendly notification to prevent redundant storage consumption.

---

## 4. Presigned URLs & Short Expiry Lifecycles

| Action | URL Type | Expiry Duration | Details |
|---|---|---|---|
| Direct Upload | Presigned `PUT` | 120 seconds | Scoped to a single UUID object key and restricted Content-Type (`image/webp`). |
| Photo Display | Presigned `GET` | 300 seconds | Generated strictly after server authorization. Never logged in server stdout or client analytics. |

> **Important**: Service worker caches are configured to NEVER store private image binaries or presigned GET URLs to prevent leakages across shared local devices.

---

## 5. Security Headers & Defense-in-Depth

The application serves strict HTTP response headers:
- `Content-Security-Policy`: Restricts scripts, styles, and remote media sources.
- `X-Frame-Options: DENY`: Prevents clickjacking.
- `X-Content-Type-Options: nosniff`: Enforces MIME types.
- `Referrer-Policy: no-referrer`: Prevents private query strings or paths from leaking to external referrers.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Denies hardware access.
- `X-Robots-Tag: noindex, nofollow`: Instructs search engines not to crawl.

---

## 6. Pre-Deployment Security Checklist

- [ ] All `.env` files are ignored in `.gitignore`.
- [ ] No hardcoded tokens, AWS credentials, or Supabase service keys exist in code.
- [ ] R2 bucket public access is disabled in the Cloudflare dashboard.
- [ ] RLS policies are active and tested for cross-family isolation.
- [ ] Rate limiting is enabled on `/api/auth/*` and `/api/photos/presign-upload`.
- [ ] Automated scan with `npm audit` and secret detection passes.
