"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Check, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        throw new Error("Failed to load notifications");
      }
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
    } catch (err: any) {
      console.error("Notifications fetch error:", err);
      setError("Unable to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 2. Real-time delivery via SSE (/api/notifications/stream)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/notifications/stream");

        eventSource.onopen = () => {
          setIsLiveConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "connected") {
              setIsLiveConnected(true);
              if (typeof data.unreadCount === "number") {
                setUnreadCount(data.unreadCount);
              }
            } else if (data.type === "notifications_update") {
              if (typeof data.unreadCount === "number") {
                setUnreadCount(data.unreadCount);
              }
              if (Array.isArray(data.notifications)) {
                setNotifications((prev) => {
                  const incomingMap = new Map(data.notifications.map((n: NotificationItem) => [n.id, n]));
                  const merged = [
                    ...data.notifications,
                    ...prev.filter((p) => !incomingMap.has(p.id)),
                  ];
                  return merged.slice(0, 30);
                });
              }
            }
          } catch (e) {
            // Heartbeat or comment
          }
        };

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          eventSource?.close();
          // Attempt reconnection after 10 seconds
          reconnectTimeout = setTimeout(connectSSE, 10000);
        };
      } catch (e) {
        setIsLiveConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // 3. Close on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  // 4. Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) {
        fetchNotifications();
      }
    } catch {
      fetchNotifications();
    }
  };

  // 5. Mark all as read
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (!res.ok) {
        fetchNotifications();
      }
    } catch {
      fetchNotifications();
    }
  };

  // 6. Delete / dismiss notification
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!target.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) {
        fetchNotifications();
      }
    } catch {
      fetchNotifications();
    }
  };

  // 7. Filter items
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "analysis_completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "analysis_failed":
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "analysis_started":
        return <Clock className="w-4 h-4 text-primary" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* The Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        type="button"
        id="notification-bell-btn"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
          isOpen
            ? "bg-[#EFEAE2] dark:bg-[#26231F] border-[#E8E1D8] dark:border-[#34302B] text-primary"
            : "text-[#776E65] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] border-transparent hover:border-[#E8E1D8] dark:hover:border-[#34302B]"
        }`}
        title="Notifications"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 active:scale-90" />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#1A1816] shadow-xs animate-in zoom-in-75 duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Content */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="Notification Center"
          className="absolute right-0 sm:right-0 top-12 w-[310px] sm:w-[380px] bg-white dark:bg-[#201E1B] rounded-2xl border border-[#EAE4DC] dark:border-[#34302B] shadow-xl z-50 overflow-hidden flex flex-col text-[#171717] dark:text-[#F4F0E9] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#EAE4DC] dark:border-[#2E2A25] flex items-center justify-between gap-3 bg-[#FAF7F2] dark:bg-[#1A1816]/70">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} new
                </span>
              )}
              {/* Real-time status indicator */}
              <div 
                className="flex items-center gap-1 text-[10px] font-medium text-[#898078] dark:text-[#9A9085]"
                title={isLiveConnected ? "Real-time updates active" : "Reconnecting to live stream"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span className="hidden sm:inline">{isLiveConnected ? "Live" : "Syncing"}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-primary hover:text-brand-hover hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#898078] dark:text-[#9A9085] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2.5 pb-2 border-b border-[#EAE4DC] dark:border-[#2E2A25] flex items-center gap-1.5 bg-white dark:bg-[#201E1B]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "text-[#776E65] dark:text-[#C1B8AD] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F]"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-primary text-white shadow-xs"
                  : "text-[#776E65] dark:text-[#C1B8AD] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F]"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("read")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === "read"
                  ? "bg-primary text-white shadow-xs"
                  : "text-[#776E65] dark:text-[#C1B8AD] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F]"
              }`}
            >
              Read
            </button>
          </div>

          {/* Body: Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#EAE4DC]/60 dark:divide-[#2E2A25]">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-[#898078] dark:text-[#9A9085] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-medium">Checking notifications...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#EAE4DC] dark:border-[#34302B] text-xs font-semibold hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] text-primary"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#EFEAE2] dark:bg-[#26231F] flex items-center justify-center mx-auto text-[#898078] dark:text-[#9A9085]">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-[#F4F0E9]">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </h4>
                <p className="text-[11px] text-[#898078] dark:text-[#9A9085] max-w-[200px] mx-auto">
                  {filter === "unread"
                    ? "You are completely caught up with all updates."
                    : "Activity and validation updates will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUnread = !notif.read;
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(notif.id);
                    }}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                      isUnread
                        ? "bg-primary/[0.04] dark:bg-primary/[0.06] hover:bg-primary/[0.08]"
                        : "hover:bg-[#FAF7F2] dark:hover:bg-[#26231F]/50"
                    }`}
                  >
                    {/* Unread Accent Dot */}
                    {isUnread && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    {/* Icon */}
                    <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] shadow-xs shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-semibold truncate ${
                          isUnread ? "text-[#171717] dark:text-[#F4F0E9] font-bold" : "text-[#514B45] dark:text-[#C1B8AD]"
                        }`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#898078] dark:text-[#9A9085] whitespace-nowrap shrink-0">
                          {formatTimestamp(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#776E65] dark:text-[#9A9085] line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Destination Link */}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Link
                          href="/ideas"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-brand-hover hover:underline"
                        >
                          <span>View Workspace</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {/* Actions (Mark read, Delete) */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="p-1 rounded hover:bg-[#EFEAE2] dark:hover:bg-[#34302B] text-[#776E65] dark:text-[#C1B8AD] hover:text-primary transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#898078] dark:text-[#9A9085] hover:text-rose-600 transition-colors"
                            title="Dismiss notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-[#EAE4DC] dark:border-[#2E2A25] bg-[#FAF7F2] dark:bg-[#1A1816]/70 flex items-center justify-between text-xs">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-[#776E65] dark:text-[#9A9085] hover:text-primary transition-colors text-[11px] font-medium"
            >
              Notification preferences
            </Link>
            <span className="text-[10px] text-[#898078] dark:text-[#9A9085]">
              Real-time delivery
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
