import { FamilyMember, Photo, Album, AuditLogItem } from "./types";

// Whitelist of authorized family phone numbers
export const AUTHORIZED_PHONE_NUMBERS = [
  "9965143222",
  "9677528787",
  "6369124248",
  "9092133222",
] as const;

export function isAuthorizedPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, "");
  const last10 = clean.slice(-10);
  return AUTHORIZED_PHONE_NUMBERS.includes(last10 as any);
}

// Authorized family member initial profiles
export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "mem-9965143222",
    name: "Yuvan",
    relation: "Son (Admin)",
    phone: "9965143222",
    avatar: "",
    role: "admin",
    storageUsedBytes: 0,
    approvedDevices: [
      {
        deviceId: "dev-primary",
        deviceName: "Primary Phone",
        lastSeen: new Date().toISOString(),
        authorizedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "mem-9677528787",
    name: "Family Member",
    relation: "Family",
    phone: "9677528787",
    avatar: "",
    role: "member",
    storageUsedBytes: 0,
    approvedDevices: [
      {
        deviceId: "dev-mem-1",
        deviceName: "Family Device",
        lastSeen: new Date().toISOString(),
        authorizedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "mem-6369124248",
    name: "Family Member",
    relation: "Family",
    phone: "6369124248",
    avatar: "",
    role: "member",
    storageUsedBytes: 0,
    approvedDevices: [
      {
        deviceId: "dev-mem-2",
        deviceName: "Family Device",
        lastSeen: new Date().toISOString(),
        authorizedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "mem-9092133222",
    name: "Family Member",
    relation: "Family",
    phone: "9092133222",
    avatar: "",
    role: "member",
    storageUsedBytes: 0,
    approvedDevices: [
      {
        deviceId: "dev-mem-3",
        deviceName: "Family Device",
        lastSeen: new Date().toISOString(),
        authorizedAt: new Date().toISOString(),
      },
    ],
  },
];

export const DEMO_MEMBERS: FamilyMember[] = DEFAULT_FAMILY_MEMBERS;
export const DEMO_ALBUMS: Album[] = [];
export const DEMO_PHOTOS: Photo[] = [];
export const DEMO_AUDIT_LOGS: AuditLogItem[] = [];

