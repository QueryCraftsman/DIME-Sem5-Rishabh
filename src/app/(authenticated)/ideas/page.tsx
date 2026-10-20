"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Lightbulb, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";

export default function MyIdeasPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dime-navy dark:text-white tracking-tight">
            My Ideas
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage your saved ideas, tracked concepts, and validation history.
          </p>
        </div>

        <Link
          href="/ideas/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dime-orange text-white text-sm font-semibold hover:bg-orange-600 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Validate New Idea</span>
        </Link>
      </div>

      {/* Main Workspace Table */}
      <RecentAnalysesTable />
    </div>
  );
}
