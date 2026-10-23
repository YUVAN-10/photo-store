"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { FamilyMember, Photo, Album, AuditLogItem } from "./types";
import { uploadToGitHub } from "./utils";
import { AUTHORIZED_PHONE_NUMBERS, isAuthorizedPhone, DEFAULT_FAMILY_MEMBERS } from "./demo-data";


export interface PendingUpload {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "compressing" | "uploading" | "verified" | "duplicate" | "error";
  albumId?: string;
  hash?: string;
  errorMessage?: string;
  finalSize?: number;
}

interface VaultContextType {
  // Auth state
  currentMember: FamilyMember | null;
  isAuthenticated: boolean;
  isDeviceApproved: boolean;
  loginWithPhone: (phone: string, rememberDevice?: boolean) => { success: boolean; requiresApproval?: boolean; error?: string };
  setupInitialAdmin: (admin: { name: string; relation: string; phone: string }) => FamilyMember;
  addFamilyMember: (data: { name: string; relation: string; phone: string; role?: "admin" | "member" }) => FamilyMember;
  logout: () => void;
  switchMember: (memberId: string) => void;

  // Data
  photos: Photo[];
  activePhotos: Photo[];
  trashPhotos: Photo[];
  albums: Album[];
  members: FamilyMember[];
  auditLogs: AuditLogItem[];

  // Storage
  totalStorageBytes: number;
  maxStorageBudgetBytes: number;
  storageUsagePercent: number;

  // Actions
  toggleFavorite: (photoId: string) => void;
  deletePhoto: (photoId: string) => void;
  restorePhoto: (photoId: string) => void;
  permanentlyDeletePhoto: (photoId: string) => void;
  addPhotoToAlbum: (photoId: string, albumId: string) => void;
  removePhotoFromAlbum: (photoId: string, albumId: string) => void;
  createAlbum: (name: string, description?: string) => Album;
  deleteAlbum: (albumId: string) => void;

  // Device management
  approvePendingDevice: (memberId: string, deviceId: string) => void;
  revokeApprovedDevice: (memberId: string, deviceId: string) => void;

  // Upload simulation
  simulateUpload: (files: File[], targetAlbumId?: string) => Promise<void>;
  pendingUploads: PendingUpload[];
  clearFinishedUploads: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB application budget

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDeviceApproved, setIsDeviceApproved] = useState<boolean>(true);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const syncServerPhotos = async () => {
    try {
      const res = await fetch("/api/photos");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.photos) && data.photos.length > 0) {
          setPhotos((prev) => {
            const merged = [...prev];
            for (const sp of data.photos) {
              const spFilename = sp.url.split("/").pop();
              const existingIdx = merged.findIndex(
                (p) =>
                  p.id === sp.id ||
                  (p.caption && sp.caption && p.caption.trim().toLowerCase() === sp.caption.trim().toLowerCase()) ||
                  (spFilename && p.url.includes(spFilename))
              );

              if (existingIdx === -1) {
                merged.push(sp);
              } else {
                merged[existingIdx] = {
                  ...merged[existingIdx],
                  url: sp.url,
                  thumbUrl: sp.thumbUrl,
                };
              }
            }
            return merged;
          });
        }
      }
    } catch (e) {
      console.warn("Could not sync server photos:", e);
    }
  };

  // Initialize and load from local storage
  useEffect(() => {
    try {
      const storedMembers = localStorage.getItem("fv_members");
      const storedPhotos = localStorage.getItem("fv_photos");
      const storedAlbums = localStorage.getItem("fv_albums");
      const storedLogs = localStorage.getItem("fv_audit_logs");
      const storedCurrentId = localStorage.getItem("fv_current_member_id");

      let parsedMembers: FamilyMember[] = [];
      if (storedMembers) {
        parsedMembers = JSON.parse(storedMembers);
      }

      // Ensure all authorized family members exist in members list
      const mergedMembers = [...parsedMembers];
      for (const defMember of DEFAULT_FAMILY_MEMBERS) {
        const defLast10 = defMember.phone.slice(-10);
        const exists = mergedMembers.some(
          (m) => m.phone.replace(/\D/g, "").slice(-10) === defLast10
        );
        if (!exists) {
          mergedMembers.push(defMember);
        }
      }
      setMembers(mergedMembers);

      if (storedPhotos) {
        const parsed: Photo[] = JSON.parse(storedPhotos);
        // Normalize any old raw.githubusercontent.com URLs to direct /api/photos/ proxy
        const normalized = parsed.map((p) => {
          if (p.url && p.url.includes("raw.githubusercontent.com")) {
            const filename = p.url.split("/").pop();
            const proxyUrl = `/api/photos/${filename}`;
            return { ...p, url: proxyUrl, thumbUrl: proxyUrl };
          }
          return p;
        });
        setPhotos(normalized);
      }

      if (storedAlbums) {
        setAlbums(JSON.parse(storedAlbums));
      }

      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      }

      if (parsedMembers.length > 0) {
        const found = parsedMembers.find((m) => m.id === storedCurrentId) || parsedMembers[0];
        setCurrentMember(found);
        setIsAuthenticated(true);
        setIsDeviceApproved(true);
      }
    } catch (e) {
      console.error("Error restoring vault state:", e);
    } finally {
      setIsHydrated(true);
      // Fetch latest photos from server/cloud so mobile and new devices show photos
      syncServerPhotos();
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("fv_members", JSON.stringify(members));
      localStorage.setItem("fv_photos", JSON.stringify(photos));
      localStorage.setItem("fv_albums", JSON.stringify(albums));
      localStorage.setItem("fv_audit_logs", JSON.stringify(auditLogs));
      if (currentMember) {
        localStorage.setItem("fv_current_member_id", currentMember.id);
      } else {
        localStorage.removeItem("fv_current_member_id");
      }
    } catch (e) {
      console.error("Error saving vault state:", e);
    }
  }, [members, photos, albums, auditLogs, currentMember, isHydrated]);

  // Calculate storage usage
  const totalStorageBytes = photos
    .filter((p) => !p.deletedAt)
    .reduce((acc, p) => acc + (p.sizeBytes || 0) + (p.thumbSizeBytes || 0), 0);

  const storageUsagePercent = Math.min(100, (totalStorageBytes / MAX_STORAGE_BYTES) * 100);

  const activePhotos = photos.filter((p) => !p.deletedAt);
  const trashPhotos = photos.filter((p) => !!p.deletedAt);

  // Initial Administrator Setup
  const setupInitialAdmin = ({
    name,
    relation,
    phone,
  }: {
    name: string;
    relation: string;
    phone: string;
  }): FamilyMember => {
    if (!isAuthorizedPhone(phone)) {
      throw new Error("Access denied. Only authorized family phone numbers are allowed.");
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const last10 = cleanPhone.slice(-10);

    const adminMember: FamilyMember = {
      id: "mem-" + last10,
      name,
      relation,
      phone: last10,
      avatar: "",
      role: "admin",
      storageUsedBytes: 0,
      approvedDevices: [
        {
          deviceId: "dev-" + Math.random().toString(36).substring(2, 8),
          deviceName: "Primary Device",
          lastSeen: new Date().toISOString(),
          authorizedAt: new Date().toISOString(),
        },
      ],
    };

    const newLog: AuditLogItem = {
      id: "aud-" + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: name,
      action: "FamilyVault Created",
      details: `Initialized vault with administrator ${name} (${phone})`,
    };

    setMembers((prev) => [adminMember, ...prev.filter((m) => m.phone.slice(-10) !== last10)]);
    setCurrentMember(adminMember);
    setIsAuthenticated(true);
    setIsDeviceApproved(true);
    setAuditLogs((prev) => [newLog, ...prev]);

    return adminMember;
  };

  // Add Family Member
  const addFamilyMember = ({
    name,
    relation,
    phone,
    role = "member",
  }: {
    name: string;
    relation: string;
    phone: string;
    role?: "admin" | "member";
  }): FamilyMember => {
    if (!isAuthorizedPhone(phone)) {
      throw new Error("Access denied. Only authorized family phone numbers can be added.");
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const last10 = cleanPhone.slice(-10);

    const newMember: FamilyMember = {
      id: "mem-" + last10,
      name,
      relation,
      phone: last10,
      avatar: "",
      role,
      storageUsedBytes: 0,
      approvedDevices: [
        {
          deviceId: "dev-" + Math.random().toString(36).substring(2, 8),
          deviceName: `${name}'s Device`,
          lastSeen: new Date().toISOString(),
          authorizedAt: new Date().toISOString(),
        },
      ],
    };

    setMembers((prev) => [...prev.filter((m) => m.phone.slice(-10) !== last10), newMember]);

    const newLog: AuditLogItem = {
      id: "aud-" + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: currentMember?.name || "Admin",
      action: "Member Added",
      details: `Added ${name} (${relation}) with phone ${phone}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return newMember;
  };

  // Simple Phone Login
  const loginWithPhone = (phone: string, rememberDevice = true) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const last10 = cleanPhone.slice(-10);

    // Strict Authorization: Only allow the 4 authorized family phone numbers
    if (!isAuthorizedPhone(phone)) {
      return {
        success: false,
        error: "Access denied. Only authorized family phone numbers can log in.",
      };
    }

    let found = members.find((m) => {
      const mClean = m.phone.replace(/[^0-9]/g, "").slice(-10);
      return mClean === last10;
    });

    if (!found) {
      const defaultProfile = DEFAULT_FAMILY_MEMBERS.find(
        (m) => m.phone.slice(-10) === last10
      );
      found = defaultProfile || {
        id: "mem-" + last10,
        name: "Family Member",
        relation: "Family",
        phone: last10,
        avatar: "",
        role: "member",
        storageUsedBytes: 0,
        approvedDevices: [
          {
            deviceId: "dev-" + Math.random().toString(36).substring(2, 8),
            deviceName: "Authorized Phone",
            lastSeen: new Date().toISOString(),
            authorizedAt: new Date().toISOString(),
          },
        ],
      };
      setMembers((prev) => [...prev.filter((m) => m.phone.replace(/[^0-9]/g, "").slice(-10) !== last10), found!]);
    }

    setCurrentMember(found);
    setIsAuthenticated(true);
    setIsDeviceApproved(true);

    // Sync cloud/server photos immediately on login
    syncServerPhotos();

    const newLog: AuditLogItem = {
      id: "aud-" + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: found.name,
      action: "Login",
      details: `Logged in from phone (${found.phone})`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentMember(null);
  };

  const switchMember = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (target) {
      setCurrentMember(target);
      setIsAuthenticated(true);
      setIsDeviceApproved(true);
    }
  };

  const toggleFavorite = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const deletePhoto = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, deletedAt: new Date().toISOString() } : p))
    );
    if (currentMember) {
      const newLog: AuditLogItem = {
        id: "aud-" + Date.now(),
        timestamp: new Date().toISOString(),
        actorName: currentMember.name,
        action: "Moved to Trash",
        details: "Photo moved to 30-day trash retention",
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const restorePhoto = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, deletedAt: null } : p))
    );
  };

  const permanentlyDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const addPhotoToAlbum = (photoId: string, albumId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          if (!p.albumIds.includes(albumId)) {
            return { ...p, albumIds: [...p.albumIds, albumId] };
          }
        }
        return p;
      })
    );
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, photoCount: a.photoCount + 1 } : a))
    );
  };

  const removePhotoFromAlbum = (photoId: string, albumId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          return { ...p, albumIds: p.albumIds.filter((id) => id !== albumId) };
        }
        return p;
      })
    );
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, photoCount: Math.max(0, a.photoCount - 1) } : a))
    );
  };

  const createAlbum = (name: string, description?: string): Album => {
    const newAlbum: Album = {
      id: "alb-" + Date.now(),
      name,
      description: description || "",
      coverPhotoUrl: photos[0]?.thumbUrl || "",
      photoCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAlbums((prev) => [newAlbum, ...prev]);

    const newLog: AuditLogItem = {
      id: "aud-" + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: currentMember?.name || "Admin",
      action: "Album Created",
      details: `Created album "${name}"`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return newAlbum;
  };

  const deleteAlbum = (albumId: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        albumIds: p.albumIds.filter((id) => id !== albumId),
      }))
    );
  };

  const approvePendingDevice = (memberId: string, deviceId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const pending = m.pendingDevices?.find((d) => d.deviceId === deviceId);
          if (pending) {
            const newApproved = {
              deviceId: pending.deviceId,
              deviceName: pending.deviceName,
              lastSeen: new Date().toISOString(),
              authorizedAt: new Date().toISOString(),
            };
            return {
              ...m,
              approvedDevices: [...m.approvedDevices, newApproved],
              pendingDevices: (m.pendingDevices || []).filter((d) => d.deviceId !== deviceId),
            };
          }
        }
        return m;
      })
    );

    if (currentMember?.id === memberId) {
      setIsDeviceApproved(true);
    }

    const newLog: AuditLogItem = {
      id: "aud-" + Date.now(),
      timestamp: new Date().toISOString(),
      actorName: currentMember?.name || "Admin",
      action: "Device Approved",
      details: `Approved device ID: ${deviceId} for member ID: ${memberId}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const revokeApprovedDevice = (memberId: string, deviceId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            approvedDevices: m.approvedDevices.filter((d) => d.deviceId !== deviceId),
          };
        }
        return m;
      })
    );
  };

  // Helper: Compute SHA-256 hash using Web Crypto API
  const computeSHA256 = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      return "hash-" + file.name + "-" + file.size;
    }
  };

  // Direct upload simulation with client-side compression and deduplication
  const simulateUpload = async (files: File[], targetAlbumId?: string) => {
    const uploadItems: PendingUpload[] = files.map((file) => ({
      id: "upl-" + Math.random().toString(36).substring(2, 9),
      name: file.name,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
      albumId: targetAlbumId,
    }));

    setPendingUploads((prev) => [...prev, ...uploadItems]);

    for (const item of uploadItems) {
      try {
        setPendingUploads((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, status: "compressing", progress: 15 } : u))
        );
        const hash = await computeSHA256(item.file);

        // Check if duplicate exists in active photos
        const isDuplicate = photos.some(
          (p) => !p.deletedAt && (p.hash === hash || p.caption.includes(item.name))
        );

        if (isDuplicate) {
          setPendingUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: "duplicate",
                    progress: 100,
                    errorMessage: "Skipped: identical photo already exists in your vault",
                  }
                : u
            )
          );
          continue;
        }

        // Simulated compression
await new Promise((r) => setTimeout(r, 300));
setPendingUploads((prev) =>
  prev.map((u) => (u.id === item.id ? { ...u, progress: 45 } : u))
);

// Upload to GitHub (free forever storage)
const remoteUrl = await uploadToGitHub(item.file);

// Update progress to uploading (optional visual cue)
setPendingUploads((prev) =>
  prev.map((u) => (u.id === item.id ? { ...u, status: "uploading", progress: 75 } : u))
);
await new Promise((r) => setTimeout(r, 400)); // short delay for UX

const compressedSize = Math.max(1024 * 150, Math.floor(item.file.size * 0.45));
const thumbSize = Math.floor(compressedSize * 0.08);

const newPhoto: Photo = {
  id: "ph-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
  familyId: "fam-vault",
  uploaderId: currentMember?.id || "mem-admin",
  uploaderName: currentMember?.name || "Family Member",
  uploaderRelation: currentMember?.relation || "Family",
  url: remoteUrl,
  thumbUrl: remoteUrl,
  width: 2560,
  height: 1707,
  sizeBytes: compressedSize,
  thumbSizeBytes: thumbSize,
  takenAt: new Date().toISOString(),
  uploadedAt: new Date().toISOString(),
  caption: item.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
  isFavorite: false,
  albumIds: targetAlbumId ? [targetAlbumId] : [],
  hash,
};
        

        setPhotos((prev) => [newPhoto, ...prev]);
        syncServerPhotos();

        if (targetAlbumId) {
          setAlbums((prev) =>
            prev.map((a) => (a.id === targetAlbumId ? { ...a, photoCount: a.photoCount + 1 } : a))
          );
        }

        // Update uploader storage usage
        if (currentMember) {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === currentMember.id
                ? { ...m, storageUsedBytes: m.storageUsedBytes + compressedSize + thumbSize }
                : m
            )
          );
        }

        setPendingUploads((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? {
                  ...u,
                  status: "verified",
                  progress: 100,
                  finalSize: compressedSize,
                }
              : u
          )
        );
      } catch (err: any) {
        setPendingUploads((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? {
                  ...u,
                  status: "error",
                  errorMessage: err?.message || "Upload failed. Please try again.",
                }
              : u
          )
        );
      }
    }
  };

  const clearFinishedUploads = () => {
    setPendingUploads([]);
  };

  return (
    <VaultContext.Provider
      value={{
        currentMember,
        isAuthenticated,
        isDeviceApproved,
        loginWithPhone,
        setupInitialAdmin,
        addFamilyMember,
        logout,
        switchMember,
        photos,
        activePhotos,
        trashPhotos,
        albums,
        members,
        auditLogs,
        totalStorageBytes,
        maxStorageBudgetBytes: MAX_STORAGE_BYTES,
        storageUsagePercent,
        toggleFavorite,
        deletePhoto,
        restorePhoto,
        permanentlyDeletePhoto,
        addPhotoToAlbum,
        removePhotoFromAlbum,
        createAlbum,
        deleteAlbum,
        approvePendingDevice,
        revokeApprovedDevice,
        simulateUpload,
        pendingUploads,
        clearFinishedUploads,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error("useVault must be used within VaultProvider");
  }
  return ctx;
}
