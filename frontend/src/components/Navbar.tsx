"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, FileText, ArrowRight, Layers, FolderGit2 } from "lucide-react";

export function Navbar({ onOpenUpload }: { onOpenUpload?: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white font-mono">RECLENS</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">Read • Reason • Verify • Propose</p>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link href="/projects" className="text-white hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors">
            <FolderGit2 className="w-4 h-4 text-blue-400" />
            My Projects
          </Link>
          <a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="/#differentiation" className="hover:text-white transition-colors">Why RecLens</a>
          <a href="/#features" className="hover:text-white transition-colors">Capabilities</a>
          <Link href="/projects/demo-rfp-001" className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Demo
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            My Projects
          </Link>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition hover:shadow-blue-500/40 active:scale-95 cursor-pointer"
          >
            Analyze RFP
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

