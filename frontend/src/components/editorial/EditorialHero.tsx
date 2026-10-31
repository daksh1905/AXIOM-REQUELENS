"use client";

import React, { memo } from "react";

interface EditorialHeroProps {
  category?: string;
  pageNumber?: string;
  title: string;
  subtitle?: string;
  // Optional legacy props for backwards compatibility
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
}

export const EditorialHero = memo(function EditorialHero({
  category = "/ requelens platform",
  pageNumber = "04/07",
  title,
  subtitle,
}: EditorialHeroProps) {
  return (
    <section className="pt-2 sm:pt-4 pb-8 sm:pb-12 border-b border-[#24211a]/80">
      {/* Top Eyebrow Metadata (Matching Reference Image) */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#8a7a67] pb-4 sm:pb-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <span>{category}</span>
          <span className="hidden sm:inline text-[#3a3429]">•</span>
          <span className="hidden sm:inline text-[#a89b87]">Enterprise Proposal Intelligence</span>
        </div>
        <div className="text-right">
          <span className="text-[#cda76e] font-semibold">{pageNumber}</span>
        </div>
      </div>

      {/* Huge Editorial Heading */}
      <div className="mt-4 sm:mt-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-[#f4f2ec] uppercase leading-[0.95] font-serif">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-[#9e8e7a] max-w-2xl font-sans font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
});
