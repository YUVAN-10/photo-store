"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ShieldCheck, ArrowRight, Smartphone, AlertCircle, User, HeartHandshake } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone, setupInitialAdmin, members } = useVault();

  // Login state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup state (when no members exist yet)
  const isSetupMode = members.length === 0;
  const [adminName, setAdminName] = useState("");
  const [adminRelation, setAdminRelation] = useState("Mother");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter your mobile phone number.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (isSetupMode) {
        if (!adminName.trim()) {
          setErrorMessage("Please enter your name.");
          setIsSubmitting(false);
          return;
        }
        setupInitialAdmin({
          name: adminName.trim(),
          relation: adminRelation.trim(),
          phone: phoneNumber.trim(),
        });
        setIsSubmitting(false);
        router.push("/photos");
      } else {
        const result = loginWithPhone(phoneNumber, rememberDevice);
        setIsSubmitting(false);

        if (result.success) {
          router.push("/photos");
        } else {
          setErrorMessage(
            result.error ||
              "This phone number hasn't been added to FamilyVault yet. Please ask your family administrator to invite you."
          );
        }
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md bg-surface rounded-4xl p-6 sm:p-10 border border-border shadow-warm-lg space-y-8 animate-in fade-in-50">
        {/* Brand & Welcome */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto shadow-warm shadow-primary/30">
            <Camera className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {isSetupMode ? "Setup FamilyVault" : "Welcome to FamilyVault"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {isSetupMode
                ? "Register as the family administrator to get started."
                : "Your private, secure family photo album."}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Setup fields for first-time administrator */}
          {isSetupMode && (
            <>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mom, Dad, or Alice"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="touch-target w-full pl-12 pr-4 py-3 rounded-2xl bg-surface border-2 border-border text-foreground text-base focus:outline-none focus:border-primary font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">
                  Family Relation *
                </label>
                <div className="relative">
                  <HeartHandshake className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mother, Father, Grandparent"
                    value={adminRelation}
                    onChange={(e) => setAdminRelation(e.target.value)}
                    className="touch-target w-full pl-12 pr-4 py-3 rounded-2xl bg-surface border-2 border-border text-foreground text-base focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="phone-input"
              className="block text-sm sm:text-base font-bold text-foreground mb-1.5"
            >
              Your Phone Number *
            </label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="phone-input"
                type="tel"
                inputMode="tel"
                placeholder="(555) 000-0000"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="touch-target w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface border-2 border-border text-foreground text-lg focus:outline-none focus:border-primary font-medium"
                autoComplete="tel"
                autoFocus={!isSetupMode}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              No passwords or OTP codes required. Your device is securely remembered.
            </p>
          </div>

          {/* Remember device checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <span className="text-sm text-foreground font-medium">
              Keep this device logged in
            </span>
          </label>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Large Enter Button */}
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full text-lg shadow-warm shadow-primary/25 mt-2"
          >
            <span>{isSetupMode ? "Create Vault & Enter" : "Enter FamilyVault"}</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>Private, encrypted family cloud</span>
        </div>
      </div>
    </div>
  );
}
