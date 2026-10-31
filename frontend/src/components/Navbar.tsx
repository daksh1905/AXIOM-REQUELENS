"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogIn, Menu, X } from "lucide-react";
import { TransitionLink } from "@/context/TransitionContext";

interface NavbarProps {
  onOpenUpload?: () => void;
}

export const Navbar = memo(function Navbar(_props: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "My Projects", href: "/projects" },
    { label: "Insights", href: "/insights" },
    { label: "About Us", href: "/about" },
  ];

  // Check whether the current page is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#23211b]/80 bg-[#080807]/85 backdrop-blur-xl transition-all duration-300">

      <div className="w-full px-6 sm:px-8 lg:px-10 h-18 sm:h-20 flex items-center justify-between">

        {/* RequeLens Brand Logo */}
        <TransitionLink
          href="/"
          className="flex items-center group py-1"
          aria-label="RequeLens Home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="relative h-12 sm:h-14 w-12 sm:w-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/requelens-logo.png"
              alt="RequeLens Logo"
              width={128}
              height={128}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </TransitionLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-medium tracking-wider uppercase">

          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors flex items-center gap-1.5 ${
                  active
                    ? "text-[#faf8f5] font-semibold"
                    : "text-[#b3a78f] hover:text-[#faf8f5]"
                }`}
              >
                <span>{link.label}</span>

                {active && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#cda76e] to-transparent rounded-full" />
                )}
              </TransitionLink>
            );
          })}

        </nav>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-3">

          {/* Sign In Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] via-[#cda76e] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full shadow-md shadow-[#b08d4b]/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#080807]" />
            <span>Sign In</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#b3a78f] hover:text-[#faf8f5] rounded-lg border border-[#24211a] bg-[#12110e] transition-colors"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#23211b] bg-[#0c0b0a]/95 backdrop-blur-2xl px-6 py-6 space-y-4">

          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <TransitionLink
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm tracking-wider uppercase py-2 border-b border-[#1b1915] transition-colors ${
                  active
                    ? "text-[#cda76e] font-semibold"
                    : "text-[#b3a78f] hover:text-[#faf8f5]"
                }`}
              >
                {link.label}
              </TransitionLink>
            );
          })}

        </div>
      )}

    </header>
  );
});