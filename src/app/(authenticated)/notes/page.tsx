"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  CalendarDays,
  Clock3,
  Pin,
  Plus,
  Search,
  Trash2,
  Loader2,
  Pencil,
  Copy,
  Check,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  StickyNote,
  X,
  FileText,
  Filter,
  Lightbulb,
  ExternalLink,
  Tag
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type NoteTone = "orange" | "blue" | "green" | "purple" | "amber" | "rose";

export type StickyNote = {
  id: string;
  tone: NoteTone;
  category: string;
  title: string;
  content: string;
  isPinned: boolean;
  ideaId?: string | null;
  idea?: {
    id: string;
    title: string;
    industry?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type NotesResponse = {
  items: StickyNote[];
  total: number;
  categories: string[];
};

const toneConfig: Record<
  NoteTone,
  {
    name: string;
    borderAccent: string;
    bgCard: string;
    badgeBg: string;
    dotBg: string;
    ringColor: string;
  }
> = {
  orange: {
    name: "Warm Coral",
    borderAccent: "border-l-primary",
    bgCard: "hover:border-orange-300/80 bg-white dark:bg-slate-900",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/40",
    dotBg: "bg-primary",
    ringColor: "ring-primary",
  },
  blue: {
    name: "Electric Blue",
    borderAccent: "border-l-blue-500",
    bgCard: "hover:border-blue-300/80 bg-white dark:bg-slate-900",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
    dotBg: "bg-blue-500",
    ringColor: "ring-blue-500",
  },
  green: {
    name: "Emerald Mint",
    borderAccent: "border-l-emerald-500",
    bgCard: "hover:border-emerald-300/80 bg-white dark:bg-slate-900",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
    dotBg: "bg-emerald-500",
    ringColor: "ring-emerald-500",
  },
  purple: {
    name: "Royal Violet",
    borderAccent: "border-l-purple-500",
    bgCard: "hover:border-purple-300/80 bg-white dark:bg-slate-900",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
    dotBg: "bg-purple-500",
    ringColor: "ring-purple-500",
  },
  amber: {
    name: "Golden Amber",
    borderAccent: "border-l-amber-500",
    bgCard: "hover:border-amber-300/80 bg-white dark:bg-slate-900",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
    dotBg: "bg-amber-500",
    ringColor: "ring-amber-500",
  },
  rose: {
    name: "Rose Pink",
    borderAccent: "border-l-rose-500",
    bgCard: "hover:border-rose-300/80 bg-white dark:bg-slate-900",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
    dotBg: "bg-rose-500",
    ringColor: "ring-rose-500",
  },
};

const toneOptions: NoteTone[] = ["orange", "blue", "green", "purple", "amber", "rose"];

const dateRangeLabels: Record<string, string> = {
  all: "All Time",
  "7": "Last 7 Days",
  "30": "Last 30 Days",
  "90": "Last 90 Days",
};

const sortLabels: Record<string, string> = {
  updated: "Recently Updated",
  oldest: "Oldest First",
  title: "Title (A–Z)",
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / min))}m ago`;
  }

  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))}h ago`;
  }

  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TEMPLATE_PRESETS = [
  {
    label: "Customer Pain Point",
    category: "Market Research",
    tone: "orange" as NoteTone,
    title: "Customer Pain Point & Feedback Note",
    content: "Customer Interview Takeaway:\n- Target persona:\n- Core friction / workaround:\n- Willingness to pay signal:\n- Key quote:\n",
  },
  {
    label: "Competitive Gap",
    category: "Competitive Intel",
    tone: "purple" as NoteTone,
    title: "Competitive Moat & Feature Gap Analysis",
    content: "Competitor Analysis:\n- Key players analyzed:\n- Where existing alternatives fall short:\n- Our 10x strategic differentiation:\n- Evidence source URL:\n",
  },
  {
    label: "Technical Architecture",
    category: "Tech Stack",
    tone: "blue" as NoteTone,
    title: "System Architecture & Engineering Feasibility",
    content: "Engineering Note:\n- Core components required:\n- Data pipelines / APIs:\n- Key risks & bottlenecks:\n- Estimated prototype complexity:\n",
  },
  {
    label: "Pricing & GTM Hypothesis",
    category: "User Feedback",
    tone: "green" as NoteTone,
    title: "Go-To-Market & Packaging Strategy",
    content: "GTM Strategy:\n- Ideal Customer Profile (ICP):\n- Pricing tier model (Usage vs Flat):\n- Initial acquisition channel:\n- Validation metric target:\n",
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Notes"]);
  const [activeFilter, setActiveFilter] = useState("All Notes");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [dateRange, setDateRange] = useState("all");
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // User ideas for linking notes
  const [userIdeas, setUserIdeas] = useState<Array<{ id: string; title: string; industry?: string | null }>>([]);

  interface NoteDraft {
    title: string;
    content: string;
    category: string;
    tone: NoteTone;
    isPinned: boolean;
    ideaId: string;
  }

  const [draft, setDraft] = useState<NoteDraft>({
    title: "",
    content: "",
    category: "General",
    tone: "orange",
    isPinned: false,
    ideaId: "",
  });

  // Fetch user's ideas for linking selector
  useEffect(() => {
    fetch("/api/ideas")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data.ideas || [];
        setUserIdeas(list.map((i: any) => ({ id: i.id, title: i.title, industry: i.industry })));
      })
      .catch(() => {});
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams({
        category: activeFilter === "All Notes" ? "all" : activeFilter.toLowerCase(),
        search,
        sort: sortBy,
      });

      if (selectedIdeaId && selectedIdeaId !== "all") {
        params.set("ideaId", selectedIdeaId);
      }

      const response = await fetch(`/api/notes?${params.toString()}`);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to load notes");
      }

      const payload = (await response.json()) as NotesResponse;
      setNotes(payload.items);
      setCategories(payload.categories || ["All Notes"]);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load notes right now."
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, search, sortBy, selectedIdeaId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  // Date range filtering
  const filteredNotes = useMemo(() => {
    if (dateRange === "all") {
      return notes;
    }

    const days = Number(dateRange);
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
    return notes.filter(
      (note) => new Date(note.updatedAt).getTime() >= threshold
    );
  }, [dateRange, notes]);

  // Split into pinned and regular notes
  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.isPinned),
    [filteredNotes]
  );
  const regularNotes = useMemo(
    () => filteredNotes.filter((n) => !n.isPinned),
    [filteredNotes]
  );

  // Stats calculation
  const totalNotesCount = notes.length;
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const uniqueCategoriesCount = new Set(notes.map((n) => n.category)).size;
  const linkedIdeasCount = new Set(notes.map((n) => n.ideaId).filter(Boolean)).size;

  const resetDraft = () => {
    setDraft({
      title: "",
      content: "",
      category: "General",
      tone: "orange",
      isPinned: false,
      ideaId: "",
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openNewNoteModal = (template?: typeof TEMPLATE_PRESETS[0]) => {
    if (template) {
      setDraft({
        title: template.title,
        content: template.content,
        category: template.category,
        tone: template.tone,
        isPinned: false,
        ideaId: selectedIdeaId !== "all" ? selectedIdeaId : "",
      });
    } else {
      setDraft({
        title: "",
        content: "",
        category: activeFilter !== "All Notes" ? activeFilter : "General",
        tone: "orange",
        isPinned: false,
        ideaId: selectedIdeaId !== "all" ? selectedIdeaId : "",
      });
    }
    setEditingId(null);
    setIsModalOpen(true);
  };

  const startEdit = (note: StickyNote) => {
    setEditingId(note.id);
    setDraft({
      title: note.title,
      content: note.content,
      category: note.category,
      tone: note.tone,
      isPinned: note.isPinned,
      ideaId: note.ideaId || "",
    });
    setIsModalOpen(true);
  };

  const saveNote = async () => {
    try {
      const title = draft.title.trim();
      const content = draft.content.trim();

      if (title.length < 2 || content.length < 2) {
        setErrorMessage("Please enter both a title and some note content.");
        return;
      }

      setSavingId(editingId ?? "new");
      setErrorMessage(null);

      const url = editingId ? `/api/notes/${editingId}` : "/api/notes";
      const method = editingId ? "PATCH" : "POST";

      const payload = {
        title,
        content,
        category: draft.category.trim() || "General",
        tone: draft.tone,
        isPinned: draft.isPinned,
        ideaId: draft.ideaId ? draft.ideaId : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to save note");
      }

      resetDraft();
      await loadNotes();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save note."
      );
    } finally {
      setSavingId(null);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setSavingId(noteId);
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to delete note");
      }

      await loadNotes();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete note."
      );
    } finally {
      setSavingId(null);
    }
  };

  const togglePinned = async (note: StickyNote) => {
    try {
      setSavingId(note.id);
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update pin state");
      }

      await loadNotes();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update note."
      );
    } finally {
      setSavingId(null);
    }
  };

  const copyNoteContent = (note: StickyNote) => {
    const text = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut listener (Cmd/Ctrl + Enter to save in modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void saveNote();
      } else if (isModalOpen && e.key === "Escape") {
        resetDraft();
      } else if (!isModalOpen && e.key.toLowerCase() === "n" && !["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        e.preventDefault();
        openNewNoteModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, draft]);

  return (
    <div className="min-h-screen bg-canvas-bg text-text-strong">
      <div className="max-w-[1520px] mx-auto p-4 sm:p-6 lg:p-8 space-y-7">
        
        {/* 1. TOP HEADER & WORKSPACE METRICS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-border-default/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <StickyNote className="w-4 h-4" />
              <span>Workspace Knowledge &amp; Research</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-strong tracking-tight mt-1">
              Research &amp; Workspace Notes
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
              Capture market observations, customer interview takeaways, and technical hypotheses linked to your validated product ideas.
            </p>
          </div>

          {/* Action Button & View Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border-default">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-text-strong shadow-xs"
                    : "text-text-muted hover:text-text-strong"
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-text-strong shadow-xs"
                    : "text-text-muted hover:text-text-strong"
                }`}
                title="List / Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Date Range Selector */}
            <Select value={dateRange} onValueChange={(val) => setDateRange(val || "all")}>
              <SelectTrigger className="h-10 w-[140px] rounded-xl border-border-default bg-surface-white text-xs font-semibold text-text-strong shadow-xs">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-text-muted" />
                <SelectValue placeholder="Date Range">
                  {dateRange === "7"
                    ? "Last 7 Days"
                    : dateRange === "30"
                    ? "Last 30 Days"
                    : dateRange === "90"
                    ? "Last 90 Days"
                    : "All Time"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Selector */}
            <Select value={sortBy} onValueChange={(val) => setSortBy(val || "updated")}>
              <SelectTrigger className="h-10 w-[175px] rounded-xl border-border-default bg-surface-white text-xs font-semibold text-text-strong shadow-xs">
                <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-text-muted" />
                <SelectValue placeholder="Sort">
                  {sortBy === "oldest"
                    ? "Oldest First"
                    : sortBy === "title"
                    ? "Title (A–Z)"
                    : "Recently Updated"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A–Z)</SelectItem>
              </SelectContent>
            </Select>

            {/* Primary Action Button */}
            <Button
              onClick={() => openNewNoteModal()}
              className="h-10 rounded-xl bg-primary hover:bg-brand-hover text-white px-4 text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span>New Note</span>
            </Button>
          </div>
        </div>

        {/* 2. STATS CHIPS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-surface-white border border-border-default shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Notes</p>
              <p className="text-xl font-bold text-text-strong mt-0.5">{totalNotesCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-white border border-border-default shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Pinned Notes</p>
              <p className="text-xl font-bold text-text-strong mt-0.5">{pinnedCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Pin className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-white border border-border-default shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Categories</p>
              <p className="text-xl font-bold text-text-strong mt-0.5">{uniqueCategoriesCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-white border border-border-default shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Linked Ideas</p>
              <p className="text-xl font-bold text-text-strong mt-0.5">{linkedIdeasCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 3. SEARCH & DYNAMIC FILTER BAR */}
        <div className="p-4 rounded-2xl bg-surface-white border border-border-default shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes by title, key takeaways, tags, or linked ideas..."
                className="h-10 w-full rounded-xl border border-border-default bg-canvas-bg pl-10 pr-9 text-xs font-semibold text-text-strong placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-strong p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Linked Idea Dropdown */}
            {userIdeas.length > 0 && (
              <Select value={selectedIdeaId} onValueChange={(val) => setSelectedIdeaId(val || "all")}>
                <SelectTrigger className="h-10 md:w-[240px] rounded-xl border-border-default bg-canvas-bg text-xs font-semibold text-text-strong">
                  <Layers className="mr-1.5 h-3.5 w-3.5 text-text-muted shrink-0" />
                  <SelectValue placeholder="All Product Ideas">
                    {selectedIdeaId === "all"
                      ? "All Product Ideas"
                      : userIdeas.find((i) => i.id === selectedIdeaId)?.title || "Selected Idea"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ideas</SelectItem>
                  {userIdeas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Category Filter Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((filter) => {
              const isActive = activeFilter === filter;
              const count =
                filter === "All Notes"
                  ? filteredNotes.length
                  : filteredNotes.filter((n) => n.category.toLowerCase() === filter.toLowerCase()).length;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-secondary hover:text-text-strong border border-border-default/50"
                  }`}
                >
                  <span>{filter}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-white dark:bg-slate-700 text-text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => openNewNoteModal()}
              className="h-8 px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-muted hover:text-text-strong text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors border border-dashed border-border-default cursor-pointer"
              title="Create note with custom category"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tag</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800/40 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="p-1 hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4. MAIN CONTENT AREA */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-text-secondary">Loading your workspace notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          /* EMPTY STATE (PREMIUM DESIGN) */
          <div className="p-8 sm:p-12 rounded-3xl bg-surface-white border border-border-default shadow-sm text-center space-y-6 max-w-3xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-primary mx-auto flex items-center justify-center shadow-xs">
              <StickyNote className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-text-strong">
                {search || activeFilter !== "All Notes" || selectedIdeaId !== "all"
                  ? "No notes found matching your filters"
                  : "No research notes yet"}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary">
                {search || activeFilter !== "All Notes" || selectedIdeaId !== "all"
                  ? "Try resetting your search query or switching categories to view other workspace notes."
                  : "Capture customer interview quotes, competitive discoveries, and product hypotheses for your validated ideas."}
              </p>
            </div>

            {search || activeFilter !== "All Notes" || selectedIdeaId !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All Notes");
                  setSelectedIdeaId("all");
                  setDateRange("all");
                }}
                className="h-10 px-4 rounded-xl text-xs font-semibold"
              >
                Reset All Filters
              </Button>
            ) : (
              <div className="space-y-6 pt-2">
                <Button
                  onClick={() => openNewNoteModal()}
                  className="h-11 px-5 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Note
                </Button>

                {/* Template Starter Cards */}
                <div className="pt-4 border-t border-border-default/60">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Quick-Start Templates</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    {TEMPLATE_PRESETS.map((tmpl) => (
                      <button
                        key={tmpl.label}
                        type="button"
                        onClick={() => openNewNoteModal(tmpl)}
                        className="p-3.5 rounded-xl border border-border-default hover:border-primary/50 bg-canvas-bg hover:bg-surface-white transition-all text-left flex items-start justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-text-strong group-hover:text-primary transition-colors">
                            {tmpl.label}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                            {tmpl.category} template
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-text-muted group-hover:text-primary shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* PINNED NOTES SECTION */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Pin className="w-3.5 h-3.5 fill-primary" />
                  <span>Pinned Notes ({pinnedNotes.length})</span>
                </div>

                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                      : "flex flex-col gap-3"
                  }
                >
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      viewMode={viewMode}
                      savingId={savingId}
                      copiedId={copiedId}
                      onEdit={startEdit}
                      onDelete={deleteNote}
                      onTogglePin={togglePinned}
                      onCopy={copyNoteContent}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ALL / OTHER NOTES SECTION */}
            <div className="space-y-3.5">
              {pinnedNotes.length > 0 && regularNotes.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted pt-2 border-t border-border-default/60">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Other Notes ({regularNotes.length})</span>
                </div>
              )}

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    : "flex flex-col gap-3"
                }
              >
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    savingId={savingId}
                    copiedId={copiedId}
                    onEdit={startEdit}
                    onDelete={deleteNote}
                    onTogglePin={togglePinned}
                    onCopy={copyNoteContent}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. CREATE / EDIT NOTE MODAL (MODERN SLIDE-OVER / DIALOG) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-3xl bg-surface-white border border-border-default shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-default">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center">
                    <StickyNote className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-strong">
                      {editingId ? "Edit Strategic Note" : "New Strategic Note"}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Capture insights, customer signals, or architectural considerations.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetDraft}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-strong">Note Title</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Call takeaways with B2B Customer Success lead"
                  className="h-11 w-full rounded-xl border border-border-default bg-canvas-bg px-3.5 text-sm font-semibold text-text-strong outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>

              {/* Category, Tone & Linked Idea Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-strong">Category / Tag</label>
                  <input
                    type="text"
                    value={draft.category}
                    onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Category"
                    className="h-10 w-full rounded-xl border border-border-default bg-canvas-bg px-3 text-xs font-semibold text-text-strong outline-none focus:border-primary"
                  />
                </div>

                {/* Linked Idea Select */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-text-strong">Link to Idea (Optional)</label>
                  <Select
                    value={draft.ideaId || "none"}
                    onValueChange={(val) => setDraft((prev) => ({ ...prev, ideaId: !val || val === "none" ? "" : String(val) }))}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl border-border-default bg-canvas-bg text-xs font-semibold text-text-strong">
                      <SelectValue placeholder="General / No Idea Linked">
                        {draft.ideaId
                          ? userIdeas.find((i) => i.id === draft.ideaId)?.title || "Linked Idea"
                          : "None (General Workspace Note)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (General Workspace Note)</SelectItem>
                      {userIdeas.map((idea) => (
                        <SelectItem key={idea.id} value={idea.id}>
                          {idea.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tone Palette & Pin Toggle Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-canvas-bg border border-border-default/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-muted mr-1">Tone Color:</span>
                  {toneOptions.map((tone) => {
                    const cfg = toneConfig[tone];
                    const isSelected = draft.tone === tone;
                    return (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, tone }))}
                        className={`w-6 h-6 rounded-full ${cfg.dotBg} transition-all flex items-center justify-center cursor-pointer ${
                          isSelected ? `ring-2 ring-offset-2 ${cfg.ringColor} scale-110` : "opacity-70 hover:opacity-100"
                        }`}
                        title={cfg.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, isPinned: !prev.isPinned }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    draft.isPinned
                      ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      : "bg-surface-white text-text-secondary border-border-default hover:text-text-strong"
                  }`}
                >
                  <Pin className={`w-3.5 h-3.5 ${draft.isPinned ? "fill-amber-600 text-amber-600" : ""}`} />
                  <span>{draft.isPinned ? "Pinned to Top" : "Pin to Top"}</span>
                </button>
              </div>

              {/* Note Content Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-strong">Note Content</label>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Record your observations, customer interview findings, architecture decisions, or next steps..."
                  className="w-full min-h-[180px] rounded-xl border border-border-default bg-canvas-bg p-3.5 text-xs sm:text-sm font-medium text-text-strong leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border-default">
                <span className="text-[11px] text-text-muted">
                  Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-border-default text-[10px] font-mono">⌘ + Enter</kbd> to save quickly.
                </span>

                <div className="flex items-center gap-2.5 justify-end">
                  <Button
                    variant="outline"
                    onClick={resetDraft}
                    className="h-10 rounded-xl px-4 text-xs font-semibold border-border-default"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void saveNote()}
                    disabled={savingId !== null}
                    className="h-10 rounded-xl bg-primary hover:bg-brand-hover text-white px-5 text-xs font-bold shadow-sm cursor-pointer"
                  >
                    {savingId !== null ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Note"
                    )}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// INDIVIDUAL NOTE CARD COMPONENT
// ==========================================
interface NoteCardProps {
  note: StickyNote;
  viewMode: "grid" | "list";
  savingId: string | null;
  copiedId: string | null;
  onEdit: (note: StickyNote) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: StickyNote) => void;
  onCopy: (note: StickyNote) => void;
}

function NoteCard({
  note,
  viewMode,
  savingId,
  copiedId,
  onEdit,
  onDelete,
  onTogglePin,
  onCopy,
}: NoteCardProps) {
  const cfg = toneConfig[note.tone] || toneConfig.orange;
  const wordCount = note.content ? note.content.trim().split(/\s+/).length : 0;

  if (viewMode === "list") {
    return (
      <div className={`p-4 rounded-2xl bg-surface-white border border-border-default ${cfg.borderAccent} border-l-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group`}>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotBg}`} />
              {note.category}
            </span>

            {note.idea && (
              <Link
                href={`/ideas/${note.idea.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary transition-colors max-w-[160px] truncate"
                title={`Linked to idea: ${note.idea.title}`}
              >
                <Layers className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{note.idea.title}</span>
              </Link>
            )}

            {note.isPinned && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                <Pin className="w-3 h-3 fill-amber-600" />
                Pinned
              </span>
            )}
          </div>

          <h3
            onClick={() => onEdit(note)}
            className="text-sm font-bold text-text-strong group-hover:text-primary transition-colors cursor-pointer truncate"
          >
            {note.title}
          </h3>

          <p className="text-xs text-text-secondary line-clamp-1 font-normal">
            {note.content}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-center shrink-0">
          <span className="text-[11px] text-text-muted flex items-center gap-1 mr-2">
            <Clock3 className="w-3 h-3" />
            {formatTime(note.updatedAt)}
          </span>

          <button
            type="button"
            onClick={() => onCopy(note)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy Note Text"
          >
            {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onTogglePin(note)}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned
                ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                : "text-text-muted hover:text-text-strong hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={note.isPinned ? "Unpin Note" : "Pin Note to Top"}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-amber-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Note"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(note.id)}
            disabled={savingId === note.id}
            className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Note"
          >
            {savingId === note.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      className={`p-5 rounded-2xl bg-surface-white border border-border-default ${cfg.borderAccent} border-l-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden`}
    >
      <div>
        {/* Card Top Row: Category, Idea Tag, Actions */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-border-default/50">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotBg}`} />
              {note.category}
            </span>

            {note.idea && (
              <Link
                href={`/ideas/${note.idea.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary transition-colors max-w-[130px] truncate"
                title={`Linked to idea: ${note.idea.title}`}
              >
                <Layers className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{note.idea.title}</span>
              </Link>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onCopy(note)}
              className="p-1 rounded-md text-text-muted hover:text-text-strong hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy content"
            >
              {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onTogglePin(note)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                note.isPinned
                  ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                  : "text-text-muted hover:text-text-strong hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={note.isPinned ? "Unpin Note" : "Pin Note to Top"}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-amber-600" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => onEdit(note)}
              className="p-1 rounded-md text-text-muted hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Edit Note"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(note.id)}
              disabled={savingId === note.id}
              className="p-1 rounded-md text-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete Note"
            >
              {savingId === note.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onEdit(note)}
          className="text-base font-bold text-text-strong group-hover:text-primary transition-colors cursor-pointer mt-3 line-clamp-2 leading-snug"
        >
          {note.title}
        </h3>

        {/* Content Preview */}
        <p className="mt-2 text-xs sm:text-[13px] font-normal leading-relaxed text-text-secondary line-clamp-4 whitespace-pre-line">
          {note.content}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3 border-t border-border-default/50 flex items-center justify-between text-[11px] font-medium text-text-muted">
        <span className="flex items-center gap-1.5">
          <Clock3 className="w-3.5 h-3.5" />
          {formatTime(note.updatedAt)}
        </span>

        <span className="text-[10px] text-text-muted">
          {wordCount} words
        </span>
      </div>
    </div>
  );
}
