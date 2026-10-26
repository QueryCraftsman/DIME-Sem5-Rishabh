"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  User, 
  Settings, 
  Sliders, 
  LogOut, 
  ChevronDown, 
  Lightbulb, 
  StickyNote, 
  ShieldCheck 
} from "lucide-react";
import { 
  getUserAvatarUrl, 
  getUserDisplayName, 
  getUserInitials 
} from "@/lib/user-profile";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [backendUser, setBackendUser] = useState<{
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync profile on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.user) {
          setBackendUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const displayName =
    backendUser?.name ||
    getUserDisplayName(session?.user?.name, session?.user?.email) ||
    "Vivek Chaurasiya";
  const email =
    backendUser?.email ||
    session?.user?.email ||
    "vivekchaurasiya943@gmail.com";
  const avatarUrl = getUserAvatarUrl(
    backendUser?.image || session?.user?.image,
    email,
    displayName
  );
  const initials = getUserInitials(displayName);
  const displayRole = "Product Lead";

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="user-profile-menu-btn"
        aria-label="User account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 sm:gap-3 p-1.5 rounded-xl border border-transparent hover:border-[#EAE4DC] dark:hover:border-[#34302B] hover:bg-[#FAF7F2] dark:hover:bg-[#201E1B] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {/* Avatar Image with Initials Fallback */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#EAE4DC] dark:border-[#34302B] bg-[#EFEAE2] dark:bg-[#26231F] flex items-center justify-center shrink-0 shadow-xs">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If avatar image fails to load, fallback to initials
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-xs font-bold text-primary">{initials}</span>
          )}
        </div>

        {/* User Info on larger screens */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="font-bold text-xs text-[#171717] dark:text-[#F4F0E9] leading-tight truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[11px] font-medium text-[#898078] dark:text-[#9A9085] leading-tight">
            {displayRole}
          </span>
        </div>

        <ChevronDown 
          className={`w-3.5 h-3.5 text-[#898078] dark:text-[#9A9085] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`} 
        />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-12 w-64 bg-white dark:bg-[#201E1B] rounded-2xl border border-[#EAE4DC] dark:border-[#34302B] shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150 text-[#171717] dark:text-[#F4F0E9]"
        >
          {/* Header with Account Details */}
          <div className="px-4 py-3 border-b border-[#EAE4DC] dark:border-[#2E2A25] bg-[#FAF7F2] dark:bg-[#1A1816]/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EAE4DC] dark:border-[#34302B] bg-[#EFEAE2] dark:bg-[#26231F] flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary">{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-[#171717] dark:text-[#F4F0E9] truncate">
                  {displayName}
                </div>
                <div className="text-xs text-[#898078] dark:text-[#9A9085] truncate">
                  {email}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{displayRole}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-medium text-[#514B45] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#FAF7F2] dark:hover:bg-[#26231F] transition-colors"
            >
              <User className="w-4 h-4 text-primary shrink-0" />
              <span>Profile Settings</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-medium text-[#514B45] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#FAF7F2] dark:hover:bg-[#26231F] transition-colors"
            >
              <Sliders className="w-4 h-4 text-[#898078] dark:text-[#9A9085] shrink-0" />
              <span>Workspace Preferences</span>
            </Link>

            <Link
              href="/ideas"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-medium text-[#514B45] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#FAF7F2] dark:hover:bg-[#26231F] transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-[#898078] dark:text-[#9A9085] shrink-0" />
              <span>My Validated Ideas</span>
            </Link>

            <Link
              href="/notes"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-medium text-[#514B45] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#FAF7F2] dark:hover:bg-[#26231F] transition-colors"
            >
              <StickyNote className="w-4 h-4 text-[#898078] dark:text-[#9A9085] shrink-0" />
              <span>Research Notes</span>
            </Link>
          </div>

          <div className="h-px bg-[#EAE4DC] dark:bg-[#2E2A25] my-1" />

          {/* Sign Out Button */}
          <div className="p-1">
            <button
              type="button"
              onClick={handleSignOut}
              role="menuitem"
              className="w-full px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
