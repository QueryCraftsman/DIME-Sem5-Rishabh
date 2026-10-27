"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  LayoutDashboard,
  BarChart3,
  Layers
} from "lucide-react";

interface SearchResultItem {
  id: string;
  type: "idea" | "note";
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string;
}

interface QuickNavItem {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function GlobalSearchModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "idea" | "note">("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quick navigation shortcuts for empty state (6 balanced items)
  const quickNav: QuickNavItem[] = [
    { 
      label: "Dashboard", 
      description: "Overview & key metrics",
      href: "/dashboard", 
      icon: <LayoutDashboard className="w-4 h-4 text-dime-orange" /> 
    },
    { 
      label: "Validate New Idea", 
      description: "Multi-mode validation engine",
      href: "/validate", 
      icon: <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 
    },
    { 
      label: "My Ideas", 
      description: "Validated ideas repository",
      href: "/ideas", 
      icon: <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" /> 
    },
    { 
      label: "Opportunity Matrix", 
      description: "Market viability quadrants",
      href: "/opportunity-matrix", 
      icon: <Compass className="w-4 h-4 text-dime-blue dark:text-blue-400" /> 
    },
    { 
      label: "Market Analysis", 
      description: "Demand & competition intelligence",
      href: "/market-analysis", 
      icon: <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 
    },
    { 
      label: "Notes & Research", 
      description: "Synthesized briefs & citations",
      href: "/notes", 
      icon: <StickyNote className="w-4 h-4 text-rose-600 dark:text-rose-400" /> 
    },
  ];

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

  // Prevent background scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(0);
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

  const handleSelectResult = useCallback((item: SearchResultItem) => {
    setIsOpen(false);
    router.push(item.href);
  }, [router]);

  const handleSelectQuickNav = useCallback((nav: QuickNavItem) => {
    setIsOpen(false);
    router.push(nav.href);
  }, [router]);

  // Keyboard navigation within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    const hasSearchResults = query.trim().length >= 2;
    const itemsCount = hasSearchResults ? filteredResults.length : quickNav.length;

    if (itemsCount === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % itemsCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hasSearchResults) {
        if (filteredResults[selectedIndex]) {
          handleSelectResult(filteredResults[selectedIndex]);
        }
      } else {
        if (quickNav[selectedIndex]) {
          handleSelectQuickNav(quickNav[selectedIndex]);
        }
      }
    }
  };

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/75 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl bg-white dark:bg-[#201E1B] rounded-3xl border border-[#E7E0D8] dark:border-[#34302B] shadow-2xl overflow-hidden flex flex-col text-[#171717] dark:text-[#F4F0E9] animate-in zoom-in-95 duration-150 my-auto sm:my-0"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#EAE4DC] dark:border-[#2E2A25] flex items-center gap-3 bg-[#FAF7F2] dark:bg-[#1A1816]/70">
          <Search className="w-5 h-5 text-dime-orange shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search ideas, competitors, notes, and research..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-[#171717] dark:text-[#F4F0E9] placeholder:text-[#8B8580] dark:placeholder:text-[#9A9085] focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-dime-orange animate-spin shrink-0" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-[#898078] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-stone-200/50 dark:hover:bg-[#26231F] transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#898078] dark:text-[#9A9085] bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Filter Pills when search results exist */}
        {results.length > 0 && (
          <div className="px-4 py-2.5 border-b border-[#EAE4DC] dark:border-[#2E2A25] flex items-center gap-2 bg-[#FCFAF7] dark:bg-[#1D1B18] text-xs">
            <span className="text-[11px] text-[#898078] dark:text-[#9A9085] font-bold uppercase tracking-wider mr-1">Filter:</span>
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-dime-orange text-white shadow-2xs"
                  : "bg-white dark:bg-[#26231F] border border-[#E7E0D8] dark:border-[#34302B] text-[#514B45] dark:text-[#C1B8AD] hover:bg-[#FAF7F2]"
              }`}
            >
              All ({results.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("idea")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "idea"
                  ? "bg-dime-orange text-white shadow-2xs"
                  : "bg-white dark:bg-[#26231F] border border-[#E7E0D8] dark:border-[#34302B] text-[#514B45] dark:text-[#C1B8AD] hover:bg-[#FAF7F2]"
              }`}
            >
              Ideas ({results.filter((r) => r.type === "idea").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("note")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "note"
                  ? "bg-dime-orange text-white shadow-2xs"
                  : "bg-white dark:bg-[#26231F] border border-[#E7E0D8] dark:border-[#34302B] text-[#514B45] dark:text-[#C1B8AD] hover:bg-[#FAF7F2]"
              }`}
            >
              Notes ({results.filter((r) => r.type === "note").length})
            </button>
          </div>
        )}

        {/* Results or Suggested Links List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-3">
          {query.trim().length >= 2 ? (
            filteredResults.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#26231F] flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-sm font-semibold text-[#171717] dark:text-[#F4F0E9]">
                  No results found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-[#898078] dark:text-[#9A9085] max-w-sm mx-auto">
                  Try searching with different keywords, or use the quick actions below to create a new idea.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-orange-50/70 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-900/50 text-[#171717] dark:text-white shadow-2xs"
                          : "border-transparent hover:bg-[#FAF7F2] dark:hover:bg-[#26231F] text-[#171717] dark:text-[#F4F0E9]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 border ${
                          item.type === "idea"
                            ? "bg-orange-50 dark:bg-orange-950/40 text-dime-orange border-orange-200/70 dark:border-orange-900/40"
                            : "bg-blue-50 dark:bg-blue-950/40 text-dime-blue border-blue-200/70 dark:border-blue-900/40"
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
                          <div className="text-[11px] text-[#898078] dark:text-[#9A9085] truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#1A1816] text-[#69645F] dark:text-[#9A9085] border border-slate-200/70 dark:border-[#34302B]">
                          {item.type}
                        </span>
                        <ArrowRight className={`w-4 h-4 transition-transform duration-150 ${
                          isSelected ? "translate-x-1 text-dime-orange" : "text-stone-400"
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Empty state / Quick navigation suggestions (balanced 2-column grid of 6 items) */
            <div className="space-y-3 p-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#898078] dark:text-[#9A9085] uppercase tracking-wider">
                  Quick Navigation
                </span>
                <span className="text-[11px] text-[#898078] dark:text-[#9A9085] font-mono">
                  Press ↑↓ to navigate
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickNav.map((nav, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={nav.href}
                      type="button"
                      onClick={() => handleSelectQuickNav(nav)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/70 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-900/50 shadow-2xs"
                          : "border-[#E7E0D8] dark:border-[#2E2A25] bg-[#FAF7F2]/60 dark:bg-[#1A1816]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#26231F]"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white dark:bg-[#201E1B] border border-[#E7E0D8] dark:border-[#34302B] shrink-0 shadow-2xs">
                        {nav.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#171717] dark:text-[#F4F0E9] truncate">
                          {nav.label}
                        </div>
                        <div className="text-[11px] text-[#898078] dark:text-[#9A9085] truncate">
                          {nav.description}
                        </div>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isSelected ? "translate-x-0.5 text-dime-orange" : "text-stone-300 dark:text-stone-600"
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with keyboard guidance */}
        <div className="px-4 py-2.5 border-t border-[#EAE4DC] dark:border-[#2E2A25] bg-[#FAF7F2] dark:bg-[#1A1816]/80 flex items-center justify-between text-[11px] text-[#898078] dark:text-[#9A9085]">
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded text-[10px] font-mono font-semibold shadow-2xs">↑↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded text-[10px] font-mono font-semibold shadow-2xs">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded text-[10px] font-mono font-semibold shadow-2xs">ESC</kbd>
              <span>close</span>
            </span>
          </div>
          <span className="hidden sm:inline-block font-medium">Global Workspace Search</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Search Input Button Trigger in Navbar */}
      <button
        type="button"
        id="global-search-trigger-btn"
        aria-label="Open global search palette"
        onClick={() => setIsOpen(true)}
        className="relative w-full max-w-md h-10 px-3.5 rounded-xl border border-[#EAE4DC] dark:border-[#34302B] bg-[#FDFBF8] dark:bg-[#201E1B] hover:border-primary/50 dark:hover:border-primary/50 flex items-center justify-between text-xs sm:text-sm text-[#8B8580] dark:text-[#9A9085] transition-all shadow-xs cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="w-4 h-4 text-[#776E65] dark:text-[#9A9085] group-hover:text-primary transition-colors shrink-0" />
          <span className="truncate">Search ideas, markets or notes...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#69645F] dark:text-[#C1B8AD] bg-[#F4F0E9] dark:bg-[#26231F] border border-[#EAE4DC] dark:border-[#34302B] rounded-md shrink-0 shadow-2xs">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </kbd>
      </button>

      {/* Render Portal directly into document.body to prevent containing block trap from navbar backdrop-blur */}
      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
