"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  StickyNote,
  Trash2,
  Check,
  Loader2,
  Pin,
  Pencil,
  Copy,
  Search,
  Sparkles,
  X,
  FileText,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type NoteTone = "orange" | "blue" | "green" | "purple" | "amber" | "rose";

export interface ContextualNote {
  id: string;
  tone: NoteTone;
  category: string;
  title: string;
  content: string;
  isPinned: boolean;
  ideaId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IdeaContextualNotesProps {
  ideaId: string;
  title: string;
}

const toneConfig: Record<
  NoteTone,
  {
    name: string;
    borderAccent: string;
    badgeBg: string;
    dotBg: string;
    ringColor: string;
  }
> = {
  orange: {
    name: "Warm Coral",
    borderAccent: "border-l-primary",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/40",
    dotBg: "bg-primary",
    ringColor: "ring-primary",
  },
  blue: {
    name: "Electric Blue",
    borderAccent: "border-l-blue-500",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
    dotBg: "bg-blue-500",
    ringColor: "ring-blue-500",
  },
  green: {
    name: "Emerald Mint",
    borderAccent: "border-l-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
    dotBg: "bg-emerald-500",
    ringColor: "ring-emerald-500",
  },
  purple: {
    name: "Royal Violet",
    borderAccent: "border-l-purple-500",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
    dotBg: "bg-purple-500",
    ringColor: "ring-purple-500",
  },
  amber: {
    name: "Amber Gold",
    borderAccent: "border-l-amber-500",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
    dotBg: "bg-amber-500",
    ringColor: "ring-amber-500",
  },
  rose: {
    name: "Rose Ruby",
    borderAccent: "border-l-rose-500",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
    dotBg: "bg-rose-500",
    ringColor: "ring-rose-500",
  },
};

const toneOptions: NoteTone[] = ["orange", "blue", "green", "purple", "amber", "rose"];

const TEMPLATE_PRESETS = [
  {
    label: "Customer Pain Point",
    category: "User Feedback",
    tone: "orange" as NoteTone,
    title: "Customer Interview & Feedback Takeaways",
    content: "Customer Interview Note:\n- Target persona & title:\n- Core friction / workaround today:\n- Willingness to pay signal:\n- Key verbatim quote:\n",
  },
  {
    label: "Competitive Gap",
    category: "Competitive Intel",
    tone: "purple" as NoteTone,
    title: "Competitor Moat & Feature Gap Analysis",
    content: "Competitive Analysis:\n- Key players analyzed:\n- Where existing tools fall short:\n- Our 10x strategic differentiator:\n- Evidence reference link:\n",
  },
  {
    label: "Technical Architecture",
    category: "Tech Stack",
    tone: "blue" as NoteTone,
    title: "System Feasibility & Tech Stack Decisions",
    content: "Engineering Note:\n- Core components required:\n- Critical APIs / data pipelines:\n- Key technical bottlenecks / unknowns:\n- Estimated prototype MVP scope:\n",
  },
  {
    label: "Pricing & GTM",
    category: "General",
    tone: "green" as NoteTone,
    title: "Pricing Model & GTM Hypothesis",
    content: "GTM Strategy:\n- Ideal Customer Profile (ICP):\n- Pricing tier model (Usage vs Flat):\n- Initial acquisition channel:\n- Validation metric target:\n",
  },
];

export function IdeaContextualNotes({ ideaId, title }: IdeaContextualNotesProps) {
  const [notes, setNotes] = useState<ContextualNote[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Notes"]);
  const [activeFilter, setActiveFilter] = useState("All Notes");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal editor state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    content: "",
    category: "General",
    tone: "orange" as NoteTone,
    isPinned: false,
  });

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes?ideaId=${ideaId}`);
      if (res.ok) {
        const data = await res.json();
        const items: ContextualNote[] = Array.isArray(data)
          ? data
          : data.items || data.notes || [];
        setNotes(items);

        // Derive categories
        const set = new Set<string>(["All Notes", "Market Research", "Tech Stack", "User Feedback", "General"]);
        items.forEach((n) => {
          if (n.category?.trim()) set.add(n.category.trim());
        });
        setCategories(Array.from(set));
      }
    } catch (e) {
      console.error("Failed to load contextual notes", e);
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (activeFilter !== "All Notes" && note.category.toLowerCase() !== activeFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${note.title} ${note.content} ${note.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [notes, activeFilter, search]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const standardNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  const openNewNoteModal = (template?: typeof TEMPLATE_PRESETS[0]) => {
    if (template) {
      setDraft({
        title: template.title,
        content: template.content,
        category: template.category,
        tone: template.tone,
        isPinned: false,
      });
    } else {
      setDraft({
        title: "",
        content: "",
        category: activeFilter !== "All Notes" ? activeFilter : "General",
        tone: "orange",
        isPinned: false,
      });
    }
    setEditingId(null);
    setIsModalOpen(true);
  };

  const startEdit = (note: ContextualNote) => {
    setEditingId(note.id);
    setDraft({
      title: note.title,
      content: note.content,
      category: note.category,
      tone: note.tone,
      isPinned: note.isPinned,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return;

    setSavingId(editingId ?? "new");
    try {
      const url = editingId ? `/api/notes/${editingId}` : "/api/notes";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          content: draft.content.trim(),
          category: draft.category.trim() || "General",
          tone: draft.tone,
          isPinned: draft.isPinned,
          ideaId,
        }),
      });

      if (res.ok) {
        closeModal();
        await fetchNotes();
      }
    } catch (err) {
      console.error("Error saving note", err);
    } finally {
      setSavingId(null);
    }
  };

  const togglePin = async (note: ContextualNote) => {
    try {
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, isPinned: !n.isPinned } : n))
      );
      await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      await fetchNotes();
    } catch (err) {
      console.error("Error toggling pin", err);
    }
  };

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error("Error deleting note", err);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = async (note: ContextualNote) => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="space-y-6 pt-2 pb-16">
      {/* 1. HEADER CARD */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200/60 dark:border-orange-800/40 shadow-xs">
                <StickyNote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-strong tracking-tight">Idea Workspace Notes</h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  Private annotations, validation hypotheses, and customer interview takeaways for{" "}
                  <span className="font-semibold text-text-strong">{title}</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Button
              onClick={() => openNewNoteModal()}
              className="h-9 px-4 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </Button>
          </div>
        </div>

        {/* Search & Categories Bar (if notes exist) */}
        {notes.length > 0 && (
          <div className="pt-3 border-t border-border-default/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search notes in this workspace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-xl border border-border-default bg-canvas-bg text-xs font-medium text-text-strong placeholder:text-text-muted outline-none focus:border-primary transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-strong p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`h-7 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-text-strong text-surface-white shadow-xs"
                        : "bg-surface-white text-text-secondary border border-border-default hover:text-text-strong hover:bg-canvas-bg"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. LOADING STATE */}
      {loading && notes.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-white border border-border-default text-center space-y-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto" />
          <p className="text-xs font-semibold text-text-secondary">Loading workspace notes...</p>
        </div>
      ) : notes.length === 0 ? (
        /* 3. EMPTY STATE WITH TEMPLATES */
        <div className="p-8 sm:p-12 rounded-2xl bg-surface-white border border-border-default text-center space-y-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-text-strong">No Workspace Notes for this Idea Yet</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Capture your customer discovery notes, competitor teardowns, and architecture thoughts as you review the validation report.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Or start with a research template:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
              {TEMPLATE_PRESETS.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => openNewNoteModal(tpl)}
                  className="p-3.5 rounded-xl border border-border-default bg-canvas-bg hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all group cursor-pointer text-left shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-text-strong group-hover:text-primary transition-colors">
                      {tpl.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2">{tpl.content.split("\n")[0]}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 4. NOTES LIST / GRID */
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Pinned Notes ({pinnedNotes.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    onTogglePin={togglePin}
                    onCopy={copyToClipboard}
                    isCopied={copiedId === note.id}
                    isDeleting={deletingId === note.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Standard Section */}
          {standardNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 px-1 pt-2">
                  <FileText className="w-3.5 h-3.5 text-text-muted" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    All Notes ({standardNotes.length})
                  </h3>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {standardNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    onTogglePin={togglePin}
                    onCopy={copyToClipboard}
                    isCopied={copiedId === note.id}
                    isDeleting={deletingId === note.id}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="p-10 rounded-2xl bg-surface-white border border-border-default text-center space-y-2">
              <StickyNote className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-sm font-bold text-text-strong">No notes match your filter</p>
              <p className="text-xs text-text-secondary">Try searching with a different term or clearing filters.</p>
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl bg-surface-white border border-border-default shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <StickyNote className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-text-strong">
                  {editingId ? "Edit Workspace Note" : "New Workspace Note"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-text-muted hover:text-text-strong hover:bg-canvas-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-strong">Note Title</label>
              <input
                type="text"
                placeholder="e.g. Call takeaways with B2B Customer Success lead"
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full h-10 px-3.5 rounded-xl border border-border-default bg-canvas-bg text-xs font-semibold text-text-strong outline-none focus:border-primary transition-all"
                autoFocus
              />
            </div>

            {/* Category Input & Tone Palette Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-strong">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Market Research, Tech Stack"
                  value={draft.category}
                  onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-xl border border-border-default bg-canvas-bg text-xs font-semibold text-text-strong outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-strong">Tone Accent</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-border-default bg-canvas-bg">
                  {toneOptions.map((tone) => {
                    const cfg = toneConfig[tone];
                    const isSelected = draft.tone === tone;
                    return (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, tone }))}
                        className={`w-5 h-5 rounded-full ${cfg.dotBg} transition-all flex items-center justify-center cursor-pointer ${
                          isSelected ? `ring-2 ring-offset-2 ${cfg.ringColor} scale-110` : "opacity-60 hover:opacity-100"
                        }`}
                        title={cfg.name}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-bg border border-border-default/60">
              <span className="text-xs font-medium text-text-secondary">Keep this note pinned at top of workspace:</span>
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
                <span>{draft.isPinned ? "Pinned" : "Pin to Top"}</span>
              </button>
            </div>

            {/* Content Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-strong">Note Content</label>
              <textarea
                placeholder="Record your observations, customer interview findings, architecture decisions, or next steps..."
                value={draft.content}
                onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                rows={5}
                className="w-full p-3.5 rounded-xl border border-border-default bg-canvas-bg text-xs font-medium text-text-strong leading-relaxed outline-none focus:border-primary transition-all resize-y"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-default">
              <Button
                variant="outline"
                onClick={closeModal}
                className="h-9 rounded-xl px-4 text-xs font-semibold border-border-default"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={savingId !== null || !draft.title.trim()}
                className="h-9 rounded-xl bg-primary hover:bg-brand-hover text-white px-5 text-xs font-bold shadow-sm cursor-pointer"
              >
                {savingId !== null ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Note"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// INDIVIDUAL NOTE CARD COMPONENT
// ==========================================
interface NoteCardProps {
  note: ContextualNote;
  onEdit: (n: ContextualNote) => void;
  onDelete: (id: string) => void;
  onTogglePin: (n: ContextualNote) => void;
  onCopy: (n: ContextualNote) => void;
  isCopied: boolean;
  isDeleting: boolean;
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onCopy,
  isCopied,
  isDeleting,
}: NoteCardProps) {
  const cfg = toneConfig[note.tone] || toneConfig.orange;

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-surface-white border border-border-default/80 hover:border-border-default hover:shadow-md transition-all duration-200 border-l-4 ${cfg.borderAccent}`}
    >
      <div className="space-y-3">
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.badgeBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotBg}`} />
              {note.category || "General"}
            </span>

            {note.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                <Pin className="w-2.5 h-2.5 fill-amber-600" />
                Pinned
              </span>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onCopy(note)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-canvas-bg transition-colors"
              title="Copy to clipboard"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onTogglePin(note)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-canvas-bg transition-colors"
              title={note.isPinned ? "Unpin note" : "Pin note to top"}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-amber-600 text-amber-600" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => onEdit(note)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-canvas-bg transition-colors"
              title="Edit note"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(note.id)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete note"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h4 className="text-sm font-bold text-text-strong line-clamp-2 leading-snug">
          {note.title}
        </h4>

        {/* Note Content Preview */}
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-4 whitespace-pre-wrap">
          {note.content}
        </p>
      </div>

      {/* Footer Timestamp */}
      <div className="pt-3 mt-3 border-t border-border-default/50 flex items-center justify-between text-[11px] text-text-muted">
        <span>{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "Just now"}</span>
      </div>
    </div>
  );
}
