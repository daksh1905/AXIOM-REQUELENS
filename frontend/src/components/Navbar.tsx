"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { TransitionLink } from "@/context/TransitionContext";

interface NavbarProps {
  onOpenUpload?: () => void;
}

export const Navbar = memo(function Navbar({ onOpenUpload }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact navigation items: Home | My Projects | Insights | About Us
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "My Projects", href: "/projects" },
    { label: "Insights", href: "/insights" },
    { label: "About Us", href: "/about" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#23211b]/80 bg-[#080807]/85 backdrop-blur-xl transition-all duration-300">
      <div className="w-full px-6 sm:px-8 lg:px-10 h-18 sm:h-20 flex items-center justify-between">
        {/* Editorial Brand Logo using supplied asset */}
        <TransitionLink href="/" className="flex items-center group py-1" aria-label="RequeLens Home">
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

        {/* Minimal Restrained Navigation: Home | My Projects | Insights | About Us */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-medium tracking-wider uppercase">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors flex items-center gap-1.5 ${
                  active ? "text-[#faf8f5] font-semibold" : "text-[#b3a78f] hover:text-[#faf8f5]"
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

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#b3a78f] hover:text-[#faf8f5] rounded-lg border border-[#24211a] bg-[#12110e]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  active ? "text-[#cda76e] font-semibold" : "text-[#b3a78f] hover:text-[#faf8f5]"
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
