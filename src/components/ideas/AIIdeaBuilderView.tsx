"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, 
  RotateCcw, 
  Sparkles, 
  User, 
  Bot, 
  Play, 
  Loader2, 
  Layers, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SharedIdeaReviewModal, ExtractedIdeaData } from "./SharedIdeaReviewModal";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedQuestions?: string[];
  timestamp: string;
}

interface AIIdeaBuilderViewProps {
  messages: ChatMessage[];
  onUpdateMessages: (msgs: ChatMessage[]) => void;
  onResetMessages: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial-msg",
  role: "assistant",
  content: "Hi! Let's develop your idea together. You don't need a complete business plan. Tell me what you have in mind, and I'll help you clarify the problem, target users, and solution.",
  suggestedQuestions: [
    "I have a rough B2B SaaS idea",
    "I want to solve a pain point for students",
    "I'm exploring an AI developer tool"
  ],
  timestamp: "Just now",
};

export function AIIdeaBuilderView({
  messages,
  onUpdateMessages,
  onResetMessages,
}: AIIdeaBuilderViewProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedIdeaData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Ensure initial greeting exists
  useEffect(() => {
    if (messages.length === 0) {
      onUpdateMessages([INITIAL_MESSAGE]);
    }
  }, [messages.length, onUpdateMessages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setInputText("");
    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    onUpdateMessages(newHistory);
    setIsSending(true);

    try {
      // Format messages for backend
      const payloadMessages = newHistory.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ideas/builder-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Builder failed to respond.");
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        suggestedQuestions: data.suggested_questions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      onUpdateMessages([...newHistory, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to communicate with AI Idea Builder.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Convert conversation into structured idea review
  const handleGenerateSummary = async () => {
    if (messages.length < 2) {
      setErrorMessage("Please chat with the builder first to flesh out your idea.");
      return;
    }

    setIsSummarizing(true);
    setErrorMessage(null);

    try {
      const payloadMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ideas/builder-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to generate idea summary.");
      }

      const data: ExtractedIdeaData = await res.json();
      setExtractedData(data);
      setReviewModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Could not generate idea summary right now.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Confirm and start validation
  const handleStartValidation = async (finalData: ExtractedIdeaData) => {
    setIsSubmittingValidation(true);
    setErrorMessage(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const fullTranscript = messages.map(m => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");
      const payload = {
        title: finalData.title,
        description: finalData.description,
        targetAudience: finalData.target_audience,
        industry: finalData.industry,
        analysisDepth: "STANDARD",
        inputMode: "ai_builder",
        rawIdea: fullTranscript,
      };

      const res = await fetch("/api/ideas/start-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errMessage = "Failed to start analysis.";
        try {
          const errJson = await res.json();
          errMessage = errJson.detail || errJson.error || errMessage;
        } catch {
          const errText = await res.text();
          if (errText) errMessage = errText;
        }
        throw new Error(errMessage);
      }

      const result = await res.json();
      router.push(`/ideas/${result.db_idea_id}/analysis/${result.id}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      if (err.name === "AbortError") {
        setErrorMessage("Request timed out connecting to the backend. Please ensure the backend server is running and try again.");
      } else {
        setErrorMessage(err.message || "Failed to start validation pipeline. Please try again.");
      }
      setIsSubmittingValidation(false);
    }
  };

  const userMessagesCount = messages.filter(m => m.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Conversational Idea Builder</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Interactive
            </span>
          </h2>
          <p className="text-[14px] text-slate-600 dark:text-slate-400 mt-0.5">
            Refine your concept through an interactive dialogue with DIME&apos;s product strategist.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onResetMessages}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Clear and restart conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={userMessagesCount === 0 || isSummarizing}
            className={cn(
              "h-9 px-4 rounded-xl text-[12px] font-semibold flex items-center gap-2 transition-all shadow-sm",
              userMessagesCount > 0
                ? "bg-dime-orange hover:bg-[#d04b08] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSummarizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Structuring Idea...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Idea Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-[13px] font-bold",
                    isUser
                      ? "bg-dime-navy text-white border-slate-700"
                      : "bg-orange-50 dark:bg-orange-950/40 text-dime-orange border-orange-200 dark:border-orange-800"
                  )}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-[13px] leading-relaxed",
                      isUser
                        ? "bg-slate-900 text-white dark:bg-slate-800 rounded-tr-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-tl-sm font-normal"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Suggested Question Chips (only on assistant messages) */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedQuestions.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          disabled={isSending}
                          className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-orange-200/80 dark:border-orange-900/40 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors shadow-2xs text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={cn("text-[10px] text-slate-400 px-1", isUser ? "text-right" : "text-left")}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-dime-orange border border-orange-200 dark:border-orange-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[12px] text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-dime-orange" />
                <span>DIME is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-2">
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-[11px] text-red-600 dark:text-red-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 focus-within:border-dime-orange focus-within:ring-2 focus-within:ring-orange-100 dark:focus-within:ring-orange-900/30 transition-all shadow-2xs">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to the builder or explain your idea... (Press Enter to send)"
              rows={1}
              className="flex-1 text-[13px] bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none py-1.5 max-h-24 leading-normal"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputText.trim()}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                inputText.trim() && !isSending
                  ? "bg-dime-orange text-white hover:bg-orange-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              )}
              title="Send reply"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Shared Idea Review Modal */}
      {extractedData && (
        <SharedIdeaReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          data={extractedData}
          onConfirmAndValidate={handleStartValidation}
          isSubmitting={isSubmittingValidation}
        />
      )}
    </div>
  );
}
