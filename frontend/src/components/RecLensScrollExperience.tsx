"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * RequeLens Background Scroll Animation Configuration Manifest
 * Authoritative source for frame sequence assets, aspect ratios, and scrubbing parameters.
 */
export const ANIMATION_CONFIG = {
  totalFrames: 283,
  frameDir: "/requelens-frames",
  filenamePrefix: "ezgif-frame-",
  fileExtension: ".jpg",
  padLength: 3,
  nativeResolution: {
    width: 2560,
    height: 1440,
  },
  backgroundColor: "#080807",
  interpolationFactor: 0.35, // Smooth, zero-lag responsive scrub
  initialPreloadBatch: 30,   // Frames 1..30 preloaded upfront for instant interaction
  windowRadius: 16,          // Prioritized proximity window around current scrub target
  idleBatchSize: 6,          // Chunk size during browser idle frames
} as const;

export function getFrameUrl(idx: number): string {
  const frameNumber = String(idx + 1).padStart(ANIMATION_CONFIG.padLength, "0");
  return `${ANIMATION_CONFIG.frameDir}/${ANIMATION_CONFIG.filenamePrefix}${frameNumber}${ANIMATION_CONFIG.fileExtension}`;
}

export function RecLensScrollExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for animation state without causing re-renders
  const imagesRef = useRef<Array<HTMLImageElement | null>>(new Array(ANIMATION_CONFIG.totalFrames).fill(null));
  const loadStatusRef = useRef<boolean[]>(new Array(ANIMATION_CONFIG.totalFrames).fill(false));
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const priorityQueueRef = useRef<Set<number>>(new Set());
  const isReducedMotionRef = useRef<boolean>(false);

  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState<boolean>(false);

  // Find nearest loaded frame if current target frame is still downloading
  const getNearestLoadedFrame = useCallback((targetIdx: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const loaded = loadStatusRef.current;

    if (loaded[targetIdx] && images[targetIdx]) {
      return images[targetIdx];
    }

    // Search outwards from target frame index
    for (let offset = 1; offset < ANIMATION_CONFIG.totalFrames; offset++) {
      const prev = targetIdx - offset;
      if (prev >= 0 && loaded[prev] && images[prev]) {
        return images[prev];
      }
      const next = targetIdx + offset;
      if (next < ANIMATION_CONFIG.totalFrames && loaded[next] && images[next]) {
        return images[next];
      }
    }

    return null;
  }, []);

  // Render a specific frame image onto the high-DPI canvas
  const drawFrame = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width === 0 || height === 0) return;

    // Resize backing store only when viewport dimensions or DPR change
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Deep obsidian/bronze background fill matching RequeLens theme
    ctx.fillStyle = ANIMATION_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Calculate object-fit: cover scaling to fill 100vw x 100vh without distortion
    const imgWidth = img.naturalWidth || ANIMATION_CONFIG.nativeResolution.width;
    const imgHeight = img.naturalHeight || ANIMATION_CONFIG.nativeResolution.height;
    const scale = Math.max(width / imgWidth, height / imgHeight);

    const drawW = imgWidth * scale;
    const drawH = imgHeight * scale;
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }, []);

  // Preload a single frame
  const loadSingleFrame = useCallback((idx: number): Promise<HTMLImageElement | null> => {
    if (idx < 0 || idx >= ANIMATION_CONFIG.totalFrames) return Promise.resolve(null);
    if (loadStatusRef.current[idx] && imagesRef.current[idx]) {
      return Promise.resolve(imagesRef.current[idx]);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.src = getFrameUrl(idx);

      img.onload = () => {
        imagesRef.current[idx] = img;
        loadStatusRef.current[idx] = true;
        resolve(img);
      };

      img.onerror = () => {
        console.warn(`[RecLensScrollExperience] Failed to load frame: ${idx}`);
        resolve(null);
      };
    });
  }, []);

  // Prioritized loader: prioritize a window around current target frame
  const loadWindowAround = useCallback((centerIdx: number, radius = ANIMATION_CONFIG.windowRadius) => {
    const start = Math.max(0, centerIdx - radius);
    const end = Math.min(ANIMATION_CONFIG.totalFrames - 1, centerIdx + radius);

    for (let i = start; i <= end; i++) {
      if (!loadStatusRef.current[i]) {
        priorityQueueRef.current.add(i);
        loadSingleFrame(i);
      }
    }
  }, [loadSingleFrame]);

  // Main scroll calculation & RAF animation loop
  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== "undefined") {
      isReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    // 1. Preload frame 0 immediately and render it behind the Hero on mount
    loadSingleFrame(0).then((img0) => {
      if (img0) {
        setIsFirstFrameLoaded(true);
        drawFrame(img0);
        lastDrawnFrameRef.current = 0;
      }
    });

    // 2. Preload first batch for smooth initial scroll
    for (let i = 1; i <= ANIMATION_CONFIG.initialPreloadBatch; i++) {
      loadSingleFrame(i);
    }

    // 3. Progressively load remainder in small batches during browser idle periods
    let nextIdxToLoad = ANIMATION_CONFIG.initialPreloadBatch + 1;
    let idleHandlerId: any = null;

    const loadRemainingChunks = () => {
      const batchSize = ANIMATION_CONFIG.idleBatchSize;
      let count = 0;
      while (nextIdxToLoad < ANIMATION_CONFIG.totalFrames && count < batchSize) {
        if (!loadStatusRef.current[nextIdxToLoad]) {
          loadSingleFrame(nextIdxToLoad);
        }
        nextIdxToLoad++;
        count++;
      }

      if (nextIdxToLoad < ANIMATION_CONFIG.totalFrames) {
        if ("requestIdleCallback" in window) {
          idleHandlerId = (window as any).requestIdleCallback(loadRemainingChunks, { timeout: 300 });
        } else {
          idleHandlerId = setTimeout(loadRemainingChunks, 100);
        }
      }
    };

    if ("requestIdleCallback" in window) {
      idleHandlerId = (window as any).requestIdleCallback(loadRemainingChunks, { timeout: 500 });
    } else {
      idleHandlerId = setTimeout(loadRemainingChunks, 200);
    }

    // 4. Global Full-Page Scroll Listener
    // Maps standard page scroll progress (0.0 to 1.0) directly across the 283 frames
    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const rawProgress = Math.min(1, Math.max(0, currentScroll / scrollableHeight));

      if (isReducedMotionRef.current) return;

      const calculatedTargetFrame = Math.min(
        ANIMATION_CONFIG.totalFrames - 1,
        Math.max(0, Math.floor(rawProgress * (ANIMATION_CONFIG.totalFrames - 1)))
      );

      targetFrameRef.current = calculatedTargetFrame;

      // Proactively prioritize loading frames around target position
      loadWindowAround(calculatedTargetFrame, ANIMATION_CONFIG.windowRadius);
    };

    // 5. RAF Animation Loop with responsive, tight interpolation
    const renderLoop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;

      if (Math.abs(target - current) > 0.05) {
        // Tight interpolation: silky smooth, zero lag, instant direction reversal
        currentFrameRef.current += (target - current) * ANIMATION_CONFIG.interpolationFactor;
      } else {
        currentFrameRef.current = target;
      }

      const frameToDrawIdx = Math.round(currentFrameRef.current);

      if (frameToDrawIdx !== lastDrawnFrameRef.current) {
        const frameImg = getNearestLoadedFrame(frameToDrawIdx);
        if (frameImg) {
          drawFrame(frameImg);
          lastDrawnFrameRef.current = frameToDrawIdx;
        }
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      const currentImg = getNearestLoadedFrame(Math.round(currentFrameRef.current));
      if (currentImg) drawFrame(currentImg);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Start RAF loop
    rafIdRef.current = requestAnimationFrame(renderLoop);

    // Initial trigger
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (idleHandlerId) {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleHandlerId);
        } else {
          clearTimeout(idleHandlerId);
        }
      }
    };
  }, [drawFrame, getNearestLoadedFrame, loadSingleFrame, loadWindowAround]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden bg-[#080807]"
    >
      {/* High-DPI Cover Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Subtle luxury darkening vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080807]/60 via-[#080807]/25 to-[#080807]/85 pointer-events-none" />

      {/* Initial load fallback */}
      {!isFirstFrameLoaded && (
        <div className="absolute inset-0 bg-[#080807] flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-[#584936]/40 border-t-[#cda76e] animate-spin" />
        </div>
      )}
    </div>
  );
}
