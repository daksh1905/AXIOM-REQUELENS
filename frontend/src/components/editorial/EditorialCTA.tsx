"use client";

import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface EditorialCTAProps {
  label?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onAction?: () => void;
}

export function EditorialCTA({
  label = "REQUELENS",
  title = "TURN COMPLEX REQUIREMENTS INTO VERIFIED PROPOSALS.",
  subtitle = "Read. Reason. Verify. Propose.",
  ctaText = "ANALYZE AN RFP ↗",
  onAction,
}: EditorialCTAProps) {
  return (
    <section className="py-20 sm:py-32 border-t border-[#24211a]/80 text-center relative overflow-hidden">
      {/* Background ambient warm illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#cda76e]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-3xl mx-auto px-4 relative z-10 flex flex-col items-center">
        {/* Subtle pill label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2d2922] bg-[#171512] text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#cda76e] mb-6">
          <Sparkles className="w-3 h-3 text-[#cda76e]" />
          <span>{label}</span>
        </div>

        {/* Large Centered Statement (Matching Reference Bottom) */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#f4f2ec] uppercase leading-tight font-serif">
          {title}
        </h2>

        {/* Supporting Copy */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-[#9e8e7a] tracking-wide font-sans max-w-lg">
          {subtitle}
        </p>

        {/* Understated Editorial Action Button / Link */}
        <div className="mt-8 sm:mt-10">
          <button
            onClick={onAction}
            className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] via-[#cda76e] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] shadow-lg shadow-[#b08d4b]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{ctaText.replace(" ↗", "")}</span>
            <ArrowUpRight className="w-4 h-4 text-[#080807] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

