"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Lightbulb, 
  StickyNote, 
  ArrowRight, 
  Loader2, 
  X, 
  Command, 
  Sparkles,
  Compass,
  LayoutDashboard
} from "lucide-react";

interface SearchResultItem {
  id: string;
  type: "idea" | "note";
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string;
}

export function GlobalSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "idea" | "note">("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Search query error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const filteredResults = results.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const handleSelect = useCallback((item: SearchResultItem) => {
    setIsOpen(false);
    router.push(item.href);
  }, [router]);

  // Keyboard navigation within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        filteredResults.length > 0 ? (prev + 1) % filteredResults.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        filteredResults.length > 0 ? (prev - 1 + filteredResults.length) % filteredResults.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    }
  };

  // Quick navigation shortcuts for empty state
  const quickNav = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4 text-primary" /> },
    { label: "Validate New Idea", href: "/ideas/new", icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
    { label: "My Ideas", href: "/ideas", icon: <Lightbulb className="w-4 h-4 text-amber-500" /> },
    { label: "Opportunity Matrix", href: "/opportunity-matrix", icon: <Compass className="w-4 h-4 text-blue-500" /> },
    { label: "Notes & Research", href: "/notes", icon: <StickyNote className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <>
      {/* Search Input Button Trigger in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative w-full max-w-md h-10 px-3.5 rounded-xl border border-[#EAE4DC] dark:border-[#34302B] bg-[#FDFBF8] dark:bg-[#201E1B] hover:border-primary/40 dark:hover:border-primary/40 flex items-center justify-between text-xs sm:text-sm text-[#8B8580] dark:text-[#9A9085] transition-all shadow-xs cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="w-4 h-4 text-[#776E65] dark:text-[#9A9085] group-hover:text-primary transition-colors shrink-0" />
          <span className="truncate">Search ideas, markets or notes...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#69645F] dark:text-[#C1B8AD] bg-[#F4F0E9] dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded-md shrink-0">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </kbd>
      </button>

      {/* Search Palette Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Global search palette"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xl bg-white dark:bg-[#201E1B] rounded-2xl border border-[#EAE4DC] dark:border-[#34302B] shadow-2xl overflow-hidden flex flex-col text-[#171717] dark:text-[#F4F0E9] animate-in zoom-in-95 duration-150"
          >
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-[#EAE4DC] dark:border-[#2E2A25] flex items-center gap-3 bg-[#FAF7F2] dark:bg-[#1A1816]/60">
              <Search className="w-5 h-5 text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search ideas, competitors, notes, and research..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-[#171717] dark:text-[#F4F0E9] placeholder:text-[#8B8580] dark:placeholder:text-[#9A9085] focus:outline-none"
              />
              {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-[#898078] hover:text-[#171717] dark:hover:text-[#F4F0E9] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#898078] dark:text-[#9A9085] bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded">
                ESC
              </kbd>
            </div>

            {/* Filter Pills when results exist */}
            {results.length > 0 && (
              <div className="px-4 py-2 border-b border-[#EAE4DC] dark:border-[#2E2A25] flex items-center gap-2 bg-white dark:bg-[#201E1B] text-xs">
                <span className="text-[11px] text-[#898078] dark:text-[#9A9085] font-medium mr-1">Filter:</span>
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === "all"
                      ? "bg-primary text-white"
                      : "bg-[#EFEAE2] dark:bg-[#26231F] text-[#514B45] dark:text-[#C1B8AD]"
                  }`}
                >
                  All ({results.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("idea")}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === "idea"
                      ? "bg-primary text-white"
                      : "bg-[#EFEAE2] dark:bg-[#26231F] text-[#514B45] dark:text-[#C1B8AD]"
                  }`}
                >
                  Ideas ({results.filter((r) => r.type === "idea").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("note")}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === "note"
                      ? "bg-primary text-white"
                      : "bg-[#EFEAE2] dark:bg-[#26231F] text-[#514B45] dark:text-[#C1B8AD]"
                  }`}
                >
                  Notes ({results.filter((r) => r.type === "note").length})
                </button>
              </div>
            )}

            {/* Results or Suggested Links List */}
            <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2">
              {query.trim().length >= 2 ? (
                filteredResults.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-[#171717] dark:text-[#F4F0E9]">
                      No results found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-[#898078] dark:text-[#9A9085]">
                      Try searching with different keywords or create a new idea.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredResults.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary/10 border border-primary/20 text-primary"
                              : "hover:bg-[#FAF7F2] dark:hover:bg-[#26231F] text-[#171717] dark:text-[#F4F0E9]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              item.type === "idea"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            }`}>
                              {item.type === "idea" ? (
                                <Lightbulb className="w-4 h-4" />
                              ) : (
                                <StickyNote className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs sm:text-sm truncate">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-[#898078] dark:text-[#9A9085] truncate">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#1A1816] border border-[#EAE4DC] dark:border-[#34302B]">
                              {item.type}
                            </span>
                            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                              isSelected ? "translate-x-0.5 text-primary" : "text-[#898078]"
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Empty state / Quick navigation suggestions */
                <div className="p-3 space-y-3">
                  <div className="text-[11px] font-bold text-[#898078] dark:text-[#9A9085] uppercase tracking-wider px-2">
                    Quick Navigation
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {quickNav.map((nav) => (
                      <button
                        key={nav.href}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          router.push(nav.href);
                        }}
                        className="p-2.5 rounded-xl border border-[#EAE4DC] dark:border-[#2E2A25] hover:border-primary/40 bg-[#FAF7F2]/60 dark:bg-[#1A1816]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#26231F] flex items-center gap-2.5 text-xs font-semibold text-[#514B45] dark:text-[#C1B8AD] hover:text-primary transition-all text-left cursor-pointer"
                      >
                        {nav.icon}
                        <span>{nav.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with keyboard guidance */}
            <div className="px-4 py-2.5 border-t border-[#EAE4DC] dark:border-[#2E2A25] bg-[#FAF7F2] dark:bg-[#1A1816]/70 flex items-center justify-between text-[11px] text-[#898078] dark:text-[#9A9085]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded">↑↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded">↵</kbd>
                  <span>select</span>
                </span>
              </div>
              <span>Authorized Workspace Scope</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
