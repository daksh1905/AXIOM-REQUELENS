"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export type TransitionPhase = "idle" | "closing" | "covered" | "opening";

interface TransitionContextType {
  phase: TransitionPhase;
  isTransitioning: boolean;
  navigateTo: (href: string, originCoords?: { x: number; y: number }) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  phase: "idle",
  isTransitioning: false,
  navigateTo: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const targetHrefRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const failsafeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (failsafeTimerRef.current) clearTimeout(failsafeTimerRef.current);
  };

  const navigateTo = useCallback(
    (href: string, originCoords?: { x: number; y: number }) => {
      // If already at target or already transitioning, ignore duplicate trigger
      if (href === pathname || phase !== "idle") {
        return;
      }

      // Check prefers-reduced-motion
      if (typeof window !== "undefined") {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
          router.push(href);
          return;
        }

        // Set lens origin coordinates for radial CSS clip-path
        const x = originCoords ? `${Math.round(originCoords.x)}px` : "50%";
        const y = originCoords ? `${Math.round(originCoords.y)}px` : "50%";
        document.documentElement.style.setProperty("--lens-x", x);
        document.documentElement.style.setProperty("--lens-y", y);
      }

      clearAllTimers();
      targetHrefRef.current = href;
      setPhase("closing");

      // Phase 1 -> Phase 2: Lens covers screen at ~320ms, execute route change
      timerRef.current = setTimeout(() => {
        setPhase("covered");
        router.push(href);

        // Phase 2 -> Phase 3: Start opening lens after router triggers
        timerRef.current = setTimeout(() => {
          setPhase("opening");

          // Phase 3 -> Idle: Complete transition
          timerRef.current = setTimeout(() => {
            setPhase("idle");
            targetHrefRef.current = null;
          }, 320);
        }, 120);
      }, 320);

      // Failsafe timer: Ensure UI never gets stuck even if route load hangs
      failsafeTimerRef.current = setTimeout(() => {
        setPhase("idle");
        targetHrefRef.current = null;
      }, 1200);
    },
    [pathname, phase, router]
  );

  // If pathname changes, smoothly trigger the opening reveal
  useEffect(() => {
    if (phase === "covered" || phase === "closing") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("opening");
      timerRef.current = setTimeout(() => {
        setPhase("idle");
        targetHrefRef.current = null;
      }, 320);
    }
  }, [pathname]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  return (
    <TransitionContext.Provider
      value={{
        phase,
        isTransitioning: phase !== "idle",
        navigateTo,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

// Reusable TransitionLink component that replaces standard <a> or <Link>
export function TransitionLink({
  href,
  children,
  className = "",
  onClick,
  title,
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  style?: React.CSSProperties;
}) {
  const { navigateTo } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If user holds Ctrl, Cmd, Shift, or Alt, let browser handle new tab naturally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    // Call optional custom onClick
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }

    // Handle hash links or external URLs normally
    if (href.startsWith("#") || href.startsWith("http://") || href.startsWith("https://")) {
      return;
    }

    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const coords = {
      x: e.clientX || rect.left + rect.width / 2,
      y: e.clientY || rect.top + rect.height / 2,
    };
    navigateTo(href, coords);
  };

  return (
    <a href={href} onClick={handleClick} className={className} title={title} style={style}>
      {children}
    </a>
  );
}

