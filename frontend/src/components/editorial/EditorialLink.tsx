"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/context/TransitionContext";

interface EditorialLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function EditorialLink({ href, children, className = "", onClick }: EditorialLinkProps) {
  return (
    <TransitionLink
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-wider uppercase text-[#cda76e] hover:text-[#f4f2ec] transition-colors py-1 ${className}`}
    >
      <span className="relative">
        {children}
        <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#cda76e] group-hover:w-full transition-all duration-300" />
      </span>
      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </TransitionLink>
  );
}

