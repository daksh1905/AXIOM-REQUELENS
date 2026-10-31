"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { UploadModal } from "@/components/UploadModal";
import { TransitionLink } from "@/context/TransitionContext";

interface EditorialPageShellProps {
  children: React.ReactNode;
  pageWatermark?: string;
}

export function EditorialPageShell({
  children,
  pageWatermark = "/ requelens.ai",
}: EditorialPageShellProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080807] text-[#f4f2ec] flex flex-col selection:bg-[#cda76e]/30 selection:text-white">
      {/* Restrained Top Editorial Navbar */}
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Main Centered Editorial Container (Matching Reference Image) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="w-full bg-[#12110f] rounded-[24px] sm:rounded-[36px] border border-[#26231e] shadow-2xl shadow-black/80 px-4 sm:px-10 lg:px-16 py-6 sm:py-12 transition-all">
          {children}
        </div>
      </main>

      {/* Bottom Editorial Watermark / Footer (Matching Reference) */}
      <footer className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6e6354] tracking-widest uppercase border-t border-[#1c1a16] mt-auto">
        <div className="flex items-center gap-6">
          <span>{pageWatermark}</span>
          <span>•</span>
          <span>Enterprise Proposal Intelligence</span>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-6 text-[11px]">
          <TransitionLink href="/" className="hover:text-[#cda76e] transition-colors">
            Home
          </TransitionLink>
          <TransitionLink href="/projects" className="hover:text-[#cda76e] transition-colors">
            My Projects
          </TransitionLink>
          <TransitionLink href="/insights" className="hover:text-[#cda76e] transition-colors">
            Insights
          </TransitionLink>
          <TransitionLink href="/about" className="hover:text-[#cda76e] transition-colors">
            About Us
          </TransitionLink>
        </div>
      </footer>

      {/* Shared Upload Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}

