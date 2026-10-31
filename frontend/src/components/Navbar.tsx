"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FolderGit2, LogIn } from "lucide-react";
import { TransitionLink } from "@/context/TransitionContext";

export function Navbar({ onOpenUpload }: { onOpenUpload?: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#23211b]/80 bg-[#080807]/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Editorial Brand Wordmark */}
        <TransitionLink href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cda76e] via-[#b08d4b] to-[#473924] p-[1px] flex items-center justify-center shadow-lg shadow-[#b08d4b]/10 group-hover:shadow-[#b08d4b]/20 transition-all">
            <div className="w-full h-full rounded-full bg-[#0d0c0a] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#cda76e] group-hover:scale-125 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-[0.2em] text-[#faf8f5] uppercase font-mono">
                RECLENS
              </span>
              <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#201d17] text-[#cda76e] border border-[#3d3628]">
                v1.0
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-[#9e8973] font-mono -mt-0.5">
              Read • Reason • Verify • Propose
            </p>
          </div>
        </TransitionLink>

        {/* Minimal Restrained Center Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-[#b3a78f]">
          <TransitionLink
            href="/projects"
            className="hover:text-[#faf8f5] transition-colors flex items-center gap-1.5"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#cda76e]" />
            <span>My Projects</span>
          </TransitionLink>
          <a href="/#understand" className="hover:text-[#faf8f5] transition-colors">
            Intelligence
          </a>
          <a href="/#verify" className="hover:text-[#faf8f5] transition-colors">
            Claim Firewall
          </a>
          <a href="/#deliver" className="hover:text-[#faf8f5] transition-colors">
            Traceability
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <TransitionLink
            href="/projects/demo-rfp-001"
            className="hidden sm:inline-flex items-center text-xs tracking-wider uppercase text-[#9e8973] hover:text-[#faf8f5] px-3 py-1.5 transition-colors"
          >
            Demo
          </TransitionLink>

          <TransitionLink
            href="/projects"
            className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 text-xs text-[#b3a78f] border border-[#2b2720] rounded-full"
          >
            <FolderGit2 className="w-3 h-3 text-[#cda76e]" />
            Projects
          </TransitionLink>

          <button
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] via-[#cda76e] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full shadow-md shadow-[#b08d4b]/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#080807]" />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
}
