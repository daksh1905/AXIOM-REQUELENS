"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 299;

function getFrameUrl(idx: number): string {
  const frameNumber = String(idx + 1).padStart(3, "0");
  return `/reclens-frames/ezgif-frame-${frameNumber}.jpg`;
}

export function RecLensScrollExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for animation state without causing re-renders
  const imagesRef = useRef<Array<HTMLImageElement | null>>(new Array(TOTAL_FRAMES).fill(null));
  const loadStatusRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
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
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIdx - offset;
      if (prev >= 0 && loaded[prev] && images[prev]) {
        return images[prev];
      }
      const next = targetIdx + offset;
      if (next < TOTAL_FRAMES && loaded[next] && images[next]) {
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

    // Deep slate/navy background fill matching RecLens theme
    ctx.fillStyle = "#020b14";
    ctx.fillRect(0, 0, width, height);

    // Calculate object-fit: cover scaling to fill 100vw x 100vh without distortion
    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;
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
    if (idx < 0 || idx >= TOTAL_FRAMES) return Promise.resolve(null);
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
  const loadWindowAround = useCallback((centerIdx: number, radius = 16) => {
    const start = Math.max(0, centerIdx - radius);
    const end = Math.min(TOTAL_FRAMES - 1, centerIdx + radius);

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

    // 2. Preload first batch (frames 1 to 30) for smooth initial scroll
    for (let i = 1; i <= 30; i++) {
      loadSingleFrame(i);
    }

    // 3. Progressively load remainder in small batches during browser idle periods
    let nextIdxToLoad = 31;
    let idleHandlerId: any = null;

    const loadRemainingChunks = () => {
      const batchSize = 6;
      let count = 0;
      while (nextIdxToLoad < TOTAL_FRAMES && count < batchSize) {
        if (!loadStatusRef.current[nextIdxToLoad]) {
          loadSingleFrame(nextIdxToLoad);
        }
        nextIdxToLoad++;
        count++;
      }

      if (nextIdxToLoad < TOTAL_FRAMES) {
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
    // Maps standard page scroll progress (0.0 to 1.0) directly across the 299 frames
    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const rawProgress = Math.min(1, Math.max(0, currentScroll / scrollableHeight));

      if (isReducedMotionRef.current) return;

      const calculatedTargetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(rawProgress * (TOTAL_FRAMES - 1)))
      );

      targetFrameRef.current = calculatedTargetFrame;

      // Proactively prioritize loading frames around target position
      loadWindowAround(calculatedTargetFrame, 16);
    };

    // 5. RAF Animation Loop with responsive, tight interpolation
    const renderLoop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;

      if (Math.abs(target - current) > 0.05) {
        // Tight interpolation (0.35): silky smooth, zero lag, instant direction reversal
        currentFrameRef.current += (target - current) * 0.35;
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
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden bg-[#020b14]"
    >
      {/* High-DPI Cover Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Subtle darkening vignette overlay: preserves 3D animation visibility while guaranteeing text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020b14]/55 via-[#020b14]/20 to-[#020b14]/75 pointer-events-none" />

      {/* Initial load fallback */}
      {!isFirstFrameLoaded && (
        <div className="absolute inset-0 bg-[#020b14] flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
