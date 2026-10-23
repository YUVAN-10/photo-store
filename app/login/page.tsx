"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ShieldCheck, ArrowRight, AlertCircle, User, HeartHandshake, CheckCircle2, Lock } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { Button } from "@/components/ui/Button";
import { isAuthorizedPhone } from "@/lib/demo-data";

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
  const [adminRelation, setAdminRelation] = useState("Son");

  // Clean 10 digits
  const cleanDigits = phoneNumber.replace(/\D/g, "");

  // Format as XXXXX XXXXX for readable Indian mobile layout
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(raw);
    if (errorMessage) setErrorMessage("");
  };

  const formattedDisplay =
    cleanDigits.length > 5
      ? `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
      : cleanDigits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Indian phone number validation
    if (cleanDigits.length === 0) {
      setErrorMessage("Please enter your 10-digit mobile number.");
      return;
    }

    if (cleanDigits.length !== 10) {
      setErrorMessage("Phone number must be exactly 10 digits.");
      return;
    }

    if (!/^[6-9]/.test(cleanDigits)) {
      setErrorMessage("Please enter a valid Indian mobile number (must start with 6, 7, 8, or 9).");
      return;
    }

    if (!isAuthorizedPhone(cleanDigits)) {
      setErrorMessage(`Access denied: +91 ${cleanDigits} is not an authorized family member.`);
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
          phone: cleanDigits,
        });
        setIsSubmitting(false);
        router.push("/photos");
      } else {
        const result = loginWithPhone(cleanDigits, rememberDevice);
        setIsSubmitting(false);

        if (result.success) {
          router.push("/photos");
        } else {
          setErrorMessage(
            result.error ||
              "This phone number is not authorized to access FamilyVault."
          );
        }
      }
    }, 350);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 sm:w-96 sm:h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 sm:w-96 sm:h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-surface/90 dark:bg-surface/80 rounded-4xl p-6 sm:p-10 border border-border/80 shadow-2xl shadow-primary/5 space-y-7 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand & Welcome Header */}
        <div className="text-center space-y-3">
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-primary via-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-primary/30 ring-4 ring-primary/10">
            <Camera className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-sm" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center text-[10px]">
              🔒
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {isSetupMode ? "Setup FamilyVault" : "Welcome to FamilyVault"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">
              {isSetupMode
                ? "Register the family administrator device to begin."
                : "Your private, secure Indian family photo vault."}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Setup fields for first-time administrator */}
          {isSetupMode && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yuvan, Appa, Amma"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="touch-target w-full pl-12 pr-4 py-3 rounded-2xl bg-surface dark:bg-black/20 border-2 border-border text-foreground text-base focus:outline-none focus:border-primary font-medium transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Family Relation *
                </label>
                <div className="relative">
                  <HeartHandshake className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Son, Father, Mother"
                    value={adminRelation}
                    onChange={(e) => setAdminRelation(e.target.value)}
                    className="touch-target w-full pl-12 pr-4 py-3 rounded-2xl bg-surface dark:bg-black/20 border-2 border-border text-foreground text-base focus:outline-none focus:border-primary font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Indian Phone Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="phone-input"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
              >
                <span>Indian Mobile Number *</span>
              </label>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                  cleanDigits.length === 10
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "text-muted-foreground"
                }`}
              >
                {cleanDigits.length === 10 ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 10 / 10 Digits
                  </span>
                ) : (
                  `${cleanDigits.length}/10 digits`
                )}
              </span>
            </div>

            {/* Prefix + 10-digit input container */}
            <div className="flex items-center rounded-2xl bg-surface dark:bg-black/30 border-2 border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm overflow-hidden">
              {/* India Flag + Country Code */}
              <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-muted/40 border-r-2 border-border select-none text-foreground font-black text-base shrink-0">
                <span className="text-xl leading-none">🇮🇳</span>
                <span className="tracking-tight text-foreground font-bold">+91</span>
              </div>

              {/* 10-Digit Mobile Input */}
              <input
                id="phone-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="99651 43222"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="touch-target w-full px-4 py-3.5 bg-transparent text-foreground text-lg sm:text-xl font-bold tracking-wider placeholder:text-muted-foreground/40 focus:outline-none"
                autoComplete="tel-national"
                autoFocus={!isSetupMode}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <span>Enter 10-digit phone number. No OTP or passwords needed.</span>
            </p>
          </div>

          {/* Remember device checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none pt-0.5 group">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary accent-primary cursor-pointer transition-colors"
            />
            <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
              Remember this device safely
            </span>
          </label>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-in shake duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Large Enter Button */}
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full text-base sm:text-lg font-bold py-4 rounded-2xl bg-gradient-to-r from-primary to-rose-500 hover:from-primary-hover hover:to-rose-600 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <span>{isSetupMode ? "Create Vault & Enter" : "Enter FamilyVault"}</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        {/* Security badge footer */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>🇮🇳 Family-Only Private Cloud • Zero External Trackers</span>
        </div>
      </div>
    </div>
  );
}
