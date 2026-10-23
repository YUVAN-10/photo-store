export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // e.g. "Amma", "Appa", "Paati", "Thatha", "Alice"
  phone: string;
  avatar: string;
  role: "admin" | "member";
  storageUsedBytes: number;
  approvedDevices: {
    deviceId: string;
    deviceName: string;
    lastSeen: string;
    authorizedAt: string;
  }[];
  pendingDevices?: {
    deviceId: string;
    deviceName: string;
    requestedAt: string;
  }[];
}

export interface Photo {
  id: string;
  familyId: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRelation: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  thumbSizeBytes: number;
  takenAt: string; // ISO date string
  uploadedAt: string;
  caption: string;
  isFavorite: boolean;
  albumIds: string[];
  deletedAt?: string | null;
  hash?: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoUrl: string;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  details: string;
}

export interface MemoryItem {
  yearDiff: number;
  photos: Photo[];
  label: string;
}
