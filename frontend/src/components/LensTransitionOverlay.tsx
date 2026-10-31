"use client";

import React from "react";
import { usePageTransition } from "@/context/TransitionContext";

export function LensTransitionOverlay() {
  const { phase } = usePageTransition();

  if (phase === "idle") {
    return null;
  }

  const isClosing = phase === "closing";
  const isCovered = phase === "covered";
  const isOpening = phase === "opening";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[99999] pointer-events-auto overflow-hidden select-none"
    >
      {/* 
        The Lens Mask Layer:
        Uses performant CSS clip-path radial sweep originating from click coordinates
      */}
      <div
        className={`w-full h-full bg-[#080807] flex items-center justify-center relative transition-all duration-300 ${
          isClosing
            ? "animate-[lensCurtainIn_0.32s_cubic-bezier(0.4,0,0.2,1)_forwards]"
            : isOpening
            ? "animate-[lensCurtainOut_0.32s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            : "opacity-100"
        }`}
        style={{
          background: "radial-gradient(circle at var(--lens-x, 50%) var(--lens-y, 50%), #14120e 0%, #080807 80%)",
        }}
      >
        {/* Subtle camera lens aperture reticle & gold iris */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Outer golden iris ring */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#cda76e]/30 flex items-center justify-center animate-[lensReticlePulse_0.6s_ease-in-out_infinite] shadow-[0_0_50px_rgba(205,167,110,0.12)]">
            {/* Inner dashed focus ring */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-dashed border-[#8a725c]/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#cda76e] shadow-[0_0_15px_#cda76e]" />
            </div>
          </div>

          {/* Minimalist Brand Reticle */}
          <div className="mt-4 text-center space-y-1">
            <span className="text-[10px] font-mono tracking-[0.35em] text-[#faf8f5] uppercase font-bold block">
              RECLENS
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-[#9e8973] uppercase block">
              Refocusing Intelligence
            </span>
          </div>
        </div>

        {/* Cinematic edge vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      </div>
    </div>
  );
}

// Wrapper for main content to subtly scale/focus during transitions
export function PageContentWrapper({ children }: { children: React.ReactNode }) {
  const { phase } = usePageTransition();

  const className =
    phase === "closing"
      ? "page-lens-exiting"
      : phase === "opening"
      ? "page-lens-entering"
      : "";

  return <div className={`min-h-screen flex flex-col ${className}`}>{children}</div>;
}

