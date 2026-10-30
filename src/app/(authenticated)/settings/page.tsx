"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Sun,
  Moon,
  Monitor,
  User,
  Mail,
  Shield,
  Bell,
  Sliders,
  Download,
  Info,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Layers,
  Database,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/providers/ThemeProvider";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/user-profile";

interface UserPreferencesState {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  analysisCompletedNotifications: boolean;
  analysisFailedNotifications: boolean;
  weeklyDigest: boolean;
  defaultAnalysisDepth: "STANDARD" | "DEEP";
  defaultWorkspaceView: "overview" | "activity";
}

const DEFAULT_PREFERENCES: UserPreferencesState = {
  theme: "system",
  emailNotifications: true,
  analysisCompletedNotifications: true,
  analysisFailedNotifications: true,
  weeklyDigest: false,
  defaultAnalysisDepth: "STANDARD",
  defaultWorkspaceView: "overview",
};

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  // User preferences
  const [profileEmail, setProfileEmail] = useState(session?.user?.email || "");
  const [profileImage, setProfileImage] = useState<string | null>(session?.user?.image || null);

  // User preferences
  const [preferences, setPreferences] = useState<UserPreferencesState>(DEFAULT_PREFERENCES);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [isSavingPref, setIsSavingPref] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Status banner / feedback
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const email = profileEmail || session?.user?.email || "";
  const resolvedDisplayName = displayName || session?.user?.name || "User";
  const avatarUrl = getUserAvatarUrl(
    profileImage || session?.user?.image,
    email,
    resolvedDisplayName,
  );
  const initials = getUserInitials(resolvedDisplayName);

  // Sync profile name and email from session and /api/profile
  useEffect(() => {
    let mounted = true;
    if (session?.user?.name) {
      setDisplayName(session.user.name);
      setNameInput(session.user.name);
    }
    if (session?.user?.email) {
      setProfileEmail(session.user.email);
    }

    // Always fetch latest authoritative profile from backend
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.user) {
          if (data.user.name) {
            setDisplayName(data.user.name);
            setNameInput(data.user.name);
          }
          if (data.user.email) {
            setProfileEmail(data.user.email);
          }
          if (data.user.image) {
            setProfileImage(data.user.image);
          }
        }
      })
      .catch((err) => console.error("Profile load err:", err));

    return () => {
      mounted = false;
    };
  }, [session?.user]);

  // Fetch persisted preferences on load
  useEffect(() => {
    let mounted = true;
    async function loadPreferences() {
      try {
        setIsLoadingPrefs(true);
        const res = await fetch("/api/profile/preferences");
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.preferences) {
            setPreferences({
              theme: data.preferences.theme || "system",
              emailNotifications: data.preferences.emailNotifications ?? true,
              analysisCompletedNotifications: data.preferences.analysisCompletedNotifications ?? true,
              analysisFailedNotifications: data.preferences.analysisFailedNotifications ?? true,
              weeklyDigest: data.preferences.weeklyDigest ?? false,
              defaultAnalysisDepth: data.preferences.defaultAnalysisDepth || "STANDARD",
              defaultWorkspaceView: data.preferences.defaultWorkspaceView || "overview",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
      } finally {
        if (mounted) setIsLoadingPrefs(false);
      }
    }

    loadPreferences();
    return () => {
      mounted = false;
    };
  }, []);

  // Update profile name
  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      showStatus("error", "Display name must be at least 2 characters.");
      return;
    }

    try {
      setIsSavingName(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, email: email }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update profile name");
      }

      setDisplayName(trimmed);
      setIsEditingName(false);
      if (updateSession) {
        await updateSession();
      }
      showStatus("success", "Display name updated successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      showStatus("error", message);
    } finally {
      setIsSavingName(false);
    }
  };

  // Persist preference helper
  const handleUpdatePreference = useCallback(
    async (patch: Partial<UserPreferencesState>) => {
      // Optimistic update
      setPreferences((prev) => ({ ...prev, ...patch }));
      setIsSavingPref(true);

      try {
        const res = await fetch("/api/profile/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          throw new Error("Failed to save preference");
        }

        const data = await res.json();
        if (data.preferences) {
          setPreferences((prev) => ({ ...prev, ...data.preferences }));
        }
      } catch (err) {
        console.error("Failed to save preference:", err);
        showStatus("error", "Could not save preference change to server.");
      } finally {
        setIsSavingPref(false);
      }
    },
    [],
  );

  // Theme change
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    handleUpdatePreference({ theme: newTheme });
  };

  // Export workspace data
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await fetch("/api/export/data");
      if (!res.ok) throw new Error("Data export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dime_workspace_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showStatus("success", "Workspace data export downloaded successfully.");
    } catch (err) {
      console.error(err);
      showStatus("error", "Failed to export workspace data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Manage your account identity, workspace defaults, appearance, and real-time alerts.
          </p>
        </div>

        {isSavingPref && (
          <div className="flex items-center gap-2 text-xs font-medium text-primary animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saving changes...</span>
          </div>
        )}
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          role="status"
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-all duration-200 ${
            statusMessage.type === "success"
              ? "bg-success-soft text-success border-success/30"
              : "bg-danger-soft text-danger border-danger/30"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ============================================================ */}
        {/* SECTION A: Account & Profile */}
        {/* ============================================================ */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Account & Profile
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Your personal identity and profile details across DIME workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {/* Avatar & Identity Box */}
            <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-surface-secondary/50 p-3.5">
              <Avatar className="h-14 w-14 rounded-full border border-border shadow-xs">
                <AvatarImage src={avatarUrl || undefined} alt={resolvedDisplayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {resolvedDisplayName}
                  </p>
                </div>
                <p className="text-xs text-foreground-secondary truncate mt-0.5">
                  {email || "No email on record"}
                </p>
                <p className="text-[11px] text-foreground-muted mt-1">
                  Active workspace session authenticated
                </p>
              </div>
            </div>

            {/* Display Name Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="displayName" className="text-xs font-semibold text-foreground">
                  Display Name
                </Label>
                {!isEditingName && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-primary hover:text-primary-hover font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingName ? (
                <div className="space-y-2">
                  <Input
                    id="displayName"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-9 text-sm rounded-lg bg-background border-border text-foreground focus-visible:ring-primary"
                    placeholder="Enter your name"
                    disabled={isSavingName}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={isSavingName || nameInput.trim() === displayName}
                      className="h-8 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium"
                    >
                      {isSavingName ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Name"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSavingName}
                      onClick={() => {
                        setNameInput(displayName);
                        setIsEditingName(false);
                      }}
                      className="h-8 rounded-lg border-border text-xs text-foreground-secondary hover:text-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="displayName"
                  value={resolvedDisplayName}
                  className="h-9 text-sm rounded-lg bg-surface-secondary/40 border-border text-foreground"
                  readOnly
                />
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                value={email}
                className="h-9 text-sm rounded-lg bg-surface-secondary/40 border-border text-foreground-secondary cursor-not-allowed"
                readOnly
              />
              <p className="text-[11px] text-foreground-muted flex items-center gap-1.5 pt-0.5">
                <Lock className="w-3 h-3 text-foreground-muted shrink-0" />
                Managed by primary authentication provider. Contact workspace admin to transfer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION B: Appearance & Theme */}
        {/* ============================================================ */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Appearance & Theme
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Customize the visual aesthetic of the DIME workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Interface Theme</p>
                <span className="text-[11px] text-foreground-muted capitalize">
                  Active: {theme} mode
                </span>
              </div>
              <p className="text-xs text-foreground-secondary">
                Switch between Warm Editorial light mode, Sophisticated Charcoal dark mode, or follow your operating system.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Light Option */}
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                      : "border-border bg-surface hover:border-border-strong text-foreground-secondary hover:text-foreground hover:bg-surface-secondary/60"
                  }`}
                >
                  <Sun className="w-5 h-5 mb-2" />
                  <span>Light</span>
                  <span className="text-[10px] font-normal text-foreground-muted mt-0.5">
                    Warm Editorial
                  </span>
                </button>

                {/* Dark Option */}
                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                      : "border-border bg-surface hover:border-border-strong text-foreground-secondary hover:text-foreground hover:bg-surface-secondary/60"
                  }`}
                >
                  <Moon className="w-5 h-5 mb-2" />
                  <span>Dark</span>
                  <span className="text-[10px] font-normal text-foreground-muted mt-0.5">
                    Charcoal Layered
                  </span>
                </button>

                {/* System Option */}
                <button
                  type="button"
                  onClick={() => handleThemeChange("system")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === "system"
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                      : "border-border bg-surface hover:border-border-strong text-foreground-secondary hover:text-foreground hover:bg-surface-secondary/60"
                  }`}
                >
                  <Monitor className="w-5 h-5 mb-2" />
                  <span>System</span>
                  <span className="text-[10px] font-normal text-foreground-muted mt-0.5">
                    Auto Synchronize
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-surface-secondary/40 border border-border/70 p-3 text-[11px] text-foreground-muted">
              Theme preferences persist automatically to your user profile and apply across devices.
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION C: Notifications */}
        {/* ============================================================ */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Notification Alerts
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Configure real-time in-app alerts and delivery channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {/* Analysis Completed Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-surface p-3.5 hover:border-border transition-colors">
              <div className="space-y-0.5 pr-4">
                <p className="text-xs font-semibold text-foreground">
                  Analysis Completed Alerts
                </p>
                <p className="text-[11px] text-foreground-secondary">
                  Receive immediate in-app and audio notification when an idea validation finishes.
                </p>
              </div>
              <Switch
                checked={preferences.analysisCompletedNotifications}
                onCheckedChange={(checked) =>
                  handleUpdatePreference({ analysisCompletedNotifications: checked })
                }
                disabled={isLoadingPrefs}
              />
            </div>

            {/* Analysis Failed Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-surface p-3.5 hover:border-border transition-colors">
              <div className="space-y-0.5 pr-4">
                <p className="text-xs font-semibold text-foreground">
                  Analysis Failure Warnings
                </p>
                <p className="text-[11px] text-foreground-secondary">
                  Prompt notice if an agent execution encounters API quotas or timeouts.
                </p>
              </div>
              <Switch
                checked={preferences.analysisFailedNotifications}
                onCheckedChange={(checked) =>
                  handleUpdatePreference({ analysisFailedNotifications: checked })
                }
                disabled={isLoadingPrefs}
              />
            </div>

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-surface p-3.5 hover:border-border transition-colors">
              <div className="space-y-0.5 pr-4">
                <p className="text-xs font-semibold text-foreground">
                  Email Report Summaries
                </p>
                <p className="text-[11px] text-foreground-secondary">
                  Deliver executive summaries and opportunity scorecards directly to your inbox.
                </p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  handleUpdatePreference({ emailNotifications: checked })
                }
                disabled={isLoadingPrefs}
              />
            </div>

            {/* Weekly Digest Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-surface p-3.5 hover:border-border transition-colors">
              <div className="space-y-0.5 pr-4">
                <p className="text-xs font-semibold text-foreground">
                  Weekly Market Digest
                </p>
                <p className="text-[11px] text-foreground-secondary">
                  Receive curated industry opportunity movements and trend highlights every Monday.
                </p>
              </div>
              <Switch
                checked={preferences.weeklyDigest}
                onCheckedChange={(checked) =>
                  handleUpdatePreference({ weeklyDigest: checked })
                }
                disabled={isLoadingPrefs}
              />
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION D: Workspace Preferences */}
        {/* ============================================================ */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Workspace Preferences
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Configure default execution depth and landing view for validation workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Analysis Depth Preference */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Default Analysis Depth
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdatePreference({ defaultAnalysisDepth: "STANDARD" })}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferences.defaultAnalysisDepth === "STANDARD"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-surface hover:border-border-strong text-foreground-secondary"
                  }`}
                >
                  <span className="text-xs font-semibold">Standard Scan</span>
                  <span className="text-[10px] text-foreground-muted mt-1 leading-snug">
                    Balanced speed (~2m). Covers core pain points, market TAM & competitors.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdatePreference({ defaultAnalysisDepth: "DEEP" })}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferences.defaultAnalysisDepth === "DEEP"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-surface hover:border-border-strong text-foreground-secondary"
                  }`}
                >
                  <span className="text-xs font-semibold">Deep Dive</span>
                  <span className="text-[10px] text-foreground-muted mt-1 leading-snug">
                    Exhaustive multi-agent search (~5m) with patent checks & unit economics.
                  </span>
                </button>
              </div>
            </div>

            {/* Default Workspace Landing View */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-foreground">
                Analysis Workspace Default Tab
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdatePreference({ defaultWorkspaceView: "overview" })}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferences.defaultWorkspaceView === "overview"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-surface hover:border-border-strong text-foreground-secondary"
                  }`}
                >
                  <span className="text-xs font-semibold">Overview Scorecard</span>
                  <span className="text-[10px] text-foreground-muted mt-1 leading-snug">
                    Opens high-level opportunity metrics and key takeaways first.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdatePreference({ defaultWorkspaceView: "activity" })}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferences.defaultWorkspaceView === "activity"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-surface hover:border-border-strong text-foreground-secondary"
                  }`}
                >
                  <span className="text-xs font-semibold">Detailed Report</span>
                  <span className="text-[10px] text-foreground-muted mt-1 leading-snug">
                    Directly loads comprehensive intelligence breakdowns and evidence logs.
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION E: Security & Sessions */}
        {/* ============================================================ */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Security & Authentication
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Manage your active session and sign out across workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-surface-secondary/40 p-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-foreground">
                    Current Web Session
                  </p>
                </div>
                <p className="text-[11px] text-foreground-secondary">
                  Authenticated via secure NextAuth session cookie (HTTP-only)
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full h-9 rounded-lg border-border text-xs font-semibold text-danger hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out of Workspace
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION F: Data & Privacy */}
        {/* ============================================================ */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Data & Privacy
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Export workspace ideas, research notes, and analyses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-xl border border-border/70 bg-surface-secondary/40 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Isolated Workspace Privacy</span>
              </div>
              <p className="text-[11px] text-foreground-secondary leading-relaxed">
                Your business ideas, competitive research data, and notes are strictly isolated to your user account and never shared with public datasets or other workspaces.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full h-9 rounded-lg border-border text-xs font-semibold text-foreground hover:bg-surface-secondary hover:text-primary transition-colors cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-primary" />
                  Generating Archive...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-2 text-primary" />
                  Export Workspace Data (.json)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* SECTION G: About DIME */}
      {/* ============================================================ */}
      <Card className="rounded-xl border border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              About DIME
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-foreground-secondary">
            AI Product Intelligence & Multi-Agent Market Validation Platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-border/60 bg-surface-secondary/30">
              <p className="font-semibold text-foreground">Platform Engine</p>
              <p className="text-foreground-secondary mt-0.5">DIME v3.4 Active</p>
              <span className="inline-block mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                ● High-Throughput Celery Workers
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-surface-secondary/30">
              <p className="font-semibold text-foreground">Multi-Agent Core</p>
              <p className="text-foreground-secondary mt-0.5">Novelty & Opportunity Radar</p>
              <span className="inline-block mt-2 text-[10px] text-primary font-medium">
                Gemini 2.5 Flash + Web Verification
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-surface-secondary/30">
              <p className="font-semibold text-foreground">Documentation & API</p>
              <p className="text-foreground-secondary mt-0.5">Enterprise Ready</p>
              <span className="inline-block mt-2 text-[10px] text-foreground-muted">
                PostgreSQL + Redis Realtime
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
