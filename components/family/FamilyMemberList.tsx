"use client";

import React, { useState } from "react";
import {
  Smartphone,
  ShieldCheck,
  HardDrive,
  UserPlus,
  History,
  Download,
  AlertCircle,
  CheckCircle,
  Users,
} from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { isAuthorizedPhone } from "@/lib/demo-data";

export function FamilyMemberList() {
  const {
    members,
    currentMember,
    approvePendingDevice,
    revokeApprovedDevice,
    addFamilyMember,
    auditLogs,
  } = useVault();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // New member form
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "member">("member");
  const [memberError, setMemberError] = useState("");

  const isAdmin = currentMember?.role === "admin" || members.length === 0;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError("");
    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    if (!isAuthorizedPhone(newMemberPhone)) {
      setMemberError("Only authorized family phone numbers can be registered.");
      return;
    }

    try {
      addFamilyMember({
        name: newMemberName.trim(),
        relation: newMemberRelation.trim() || "Family Member",
        phone: newMemberPhone.trim(),
        role: newMemberRole,
      });

      setShowAddMember(false);
      setNewMemberName("");
      setNewMemberRelation("");
      setNewMemberPhone("");
      setMemberError("");
    } catch (err: any) {
      setMemberError(err.message || "Failed to add member.");
    }
  };

  const handleExportData = () => {
    const exportData = {
      family: "FamilyVault Workspace",
      exportedAt: new Date().toISOString(),
      memberCount: members.length,
      members: members.map((m) => ({
        name: m.name,
        relation: m.relation,
        phone: m.phone,
        role: m.role,
      })),
      auditSummary: auditLogs.slice(0, 20),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `familyvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header with Admin Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Family Members
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {members.length === 0
              ? "No family members added yet."
              : `${members.length} family member${members.length === 1 ? "" : "s"} with private access`}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuditLogs(true)}
              className="gap-1.5"
            >
              <History className="w-4 h-4 text-primary" />
              <span>Audit Log</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="gap-1.5"
            >
              <Download className="w-4 h-4 text-secondary" />
              <span>Export Backup</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddMember(true)}
              className="gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </Button>
          </div>
        )}
      </div>

      {/* Member Cards or Empty State */}
      {members.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-surface border-2 border-dashed border-border text-center space-y-4 shadow-warm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">No Family Members Registered</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Add family members using their phone numbers. They will be able to log in securely from their approved phones.
            </p>
          </div>
          <Button onClick={() => setShowAddMember(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Add First Family Member</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-warm space-y-4"
            >
              {/* Top row */}
              <div className="flex items-center gap-4">
                {member.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary font-bold text-2xl flex items-center justify-center border-2 border-primary/20 shadow-sm shrink-0">
                    {member.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg sm:text-xl text-foreground truncate">
                      {member.name}
                    </h3>
                    {member.role === "admin" && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-secondary font-medium">{member.relation}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    +91 ••••• ••{member.phone.replace(/\D/g, "").slice(-3)}
                  </p>
                </div>
              </div>

              {/* Storage used by this member */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-primary" />
                  <span>Photos Storage:</span>
                </span>
                <span className="font-bold text-foreground">
                  {formatBytes(member.storageUsedBytes || 0)}
                </span>
              </div>

              {/* Approved Devices */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-secondary" />
                  <span>Approved Devices ({(member.approvedDevices || []).length}):</span>
                </span>
                <div className="space-y-1.5">
                  {(member.approvedDevices || []).map((dev) => (
                    <div
                      key={dev.deviceId}
                      className="p-2.5 rounded-xl bg-surface border border-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{dev.deviceName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Active {formatDate(dev.lastSeen)}
                        </div>
                      </div>
                      {isAdmin && (member.approvedDevices || []).length > 1 && (
                        <button
                          onClick={() => revokeApprovedDevice(member.id, dev.deviceId)}
                          className="text-[11px] text-red-500 hover:underline font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Devices (Requires Admin Approval) */}
              {member.pendingDevices && member.pendingDevices.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Pending Device Approval:</span>
                  </div>
                  {member.pendingDevices.map((pDev) => (
                    <div
                      key={pDev.deviceId}
                      className="flex items-center justify-between text-xs pt-1"
                    >
                      <span className="font-medium text-foreground">{pDev.deviceName}</span>
                      {isAdmin ? (
                        <Button
                          size="sm"
                          onClick={() => approvePendingDevice(member.id, pDev.deviceId)}
                          className="h-8 px-3 text-xs gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </Button>
                      ) : (
                        <span className="text-muted-foreground italic">Awaiting admin</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Family Member"
        description="Register a family member's phone number. No passwords or OTPs required—they simply enter their phone number on their approved device."
      >
        <form onSubmit={handleAddMember} className="space-y-4 pt-2">
          {memberError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{memberError}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grandma, Dad, Sarah"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="touch-target w-full px-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              Family Relation *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grandmother, Father, Daughter"
              value={newMemberRelation}
              onChange={(e) => setNewMemberRelation(e.target.value)}
              className="touch-target w-full px-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              Indian Mobile Number (10 Digits) *
            </label>
            <div className="flex items-center rounded-2xl bg-surface border border-border focus-within:ring-2 focus-within:ring-primary overflow-hidden shadow-sm">
              <span className="px-3.5 py-3 bg-muted/40 border-r border-border font-bold text-sm select-none text-foreground flex items-center gap-1">
                <span>🇮🇳</span>
                <span>+91</span>
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                placeholder="Enter 10-digit number"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="touch-target w-full px-4 py-3 bg-transparent text-foreground text-base focus:outline-none font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              Access Role
            </label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as "admin" | "member")}
              className="touch-target w-full px-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
              <option value="member">Family Member (View &amp; Upload)</option>
              <option value="admin">Administrator (Manage members &amp; devices)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Family Member</Button>
          </div>
        </form>
      </Modal>

      {/* Audit Logs Modal */}
      <Modal
        isOpen={showAuditLogs}
        onClose={() => setShowAuditLogs(false)}
        title="Family Security Audit History"
        description="Log of logins, uploads, and device authorization events."
        maxWidth="lg"
      >
        <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No audit log entries yet.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-muted/30 border border-border space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">
                    {log.action} • {log.actorName}
                  </span>
                  <span className="text-muted-foreground">{formatDate(log.timestamp)}</span>
                </div>
                <p className="text-muted-foreground">{log.details}</p>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Family Vault Archive"
        description="Download your complete family catalog, album structures, and metadata in standard JSON."
      >
        <div className="space-y-4 py-3 text-sm">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
            <div className="font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-secondary" />
              <span>Self-Sovereign Family Data</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              FamilyVault never locks your memories in. You can export metadata, captions, relationships, and photo catalogs at any time.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Close
            </Button>
            <Button onClick={handleExportData} className="gap-2">
              <Download className="w-4 h-4" />
              Download Backup Archive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
