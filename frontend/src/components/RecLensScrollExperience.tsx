"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";

/**
 * RequeLens Background Scroll Animation Configuration Manifest
 * Authoritative source for frame sequence assets, aspect ratios, and scrubbing parameters.
 */
export const ANIMATION_CONFIG = {
  totalFrames: 284,
  frameDir: "/requelens-frames",
  filenamePrefix: "ezgif-frame-",
  fileExtension: ".webp",
  fallbackExtension: ".jpg",
  padLength: 3,
  nativeResolution: {
    width: 2560,
    height: 1440,
  },
  backgroundColor: "#080807",
  baseLambda: 18.0,              // Frame-rate-independent damping (~120ms settling time for responsive, silky tracking)
  fastCatchupLambda: 36.0,        // Accelerated catch-up on rapid scrolls (~60ms settling time)
  settleThreshold: 0.0001,        // Settle snapping threshold below which displayProgress snaps to target
  subFrameBlendThreshold: 0.012,  // Minimum sub-frame blend difference (1.2%) required to trigger canvas redraw
  initialPreloadBatch: 35,        // Frames 1..35 preloaded upfront
  windowRadius: 20,               // Proximity sliding buffer around current scrub position
  idleBatchSize: 10,              // Chunk size during browser idle frames
  maxDPR: 1.5,                    // Caps backing store DPI to prevent 4K fill-rate stalls
} as const;

export function getFrameUrl(idx: number, useFallback = false): string {
  const frameNumber = String(idx + 1).padStart(ANIMATION_CONFIG.padLength, "0");
  const ext = useFallback ? ANIMATION_CONFIG.fallbackExtension : ANIMATION_CONFIG.fileExtension;
  return `${ANIMATION_CONFIG.frameDir}/${ANIMATION_CONFIG.filenamePrefix}${frameNumber}${ext}`;
}

export const RecLensScrollExperience = memo(function RecLensScrollExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // References for animation state without causing re-renders
  const imagesRef = useRef<Array<HTMLImageElement | null>>(new Array(ANIMATION_CONFIG.totalFrames).fill(null));
  // 0 = unrequested, 1 = loading/decoding, 2 = loaded/ready, -1 = error
  const loadStateRef = useRef<Int8Array>(new Int8Array(ANIMATION_CONFIG.totalFrames));

  // Continuous floating-point progress tracking for cinematic smoothness
  const targetProgressRef = useRef<number>(0);
  const displayProgressRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastDrawnFrameARef = useRef<number>(-1);
  const lastDrawnBlendRef = useRef<number>(-1);
  const lastPreloadFrameRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const isReducedMotionRef = useRef<boolean>(false);

  // Pre-calculated canvas layout & cover-fit geometry (recalculated ONLY on resize)
  const layoutRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    maxScroll: 1,
    drawX: 0,
    drawY: 0,
    drawW: 0,
    drawH: 0,
  });

  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState<boolean>(false);

  // Find nearest loaded frame if current target frame is still downloading
  const getNearestLoadedFrame = useCallback((targetIdx: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const states = loadStateRef.current;

    if (states[targetIdx] === 2 && images[targetIdx]) {
      return images[targetIdx];
    }

    // Bidirectional outwards search
    for (let offset = 1; offset < ANIMATION_CONFIG.totalFrames; offset++) {
      const prev = targetIdx - offset;
      if (prev >= 0 && states[prev] === 2 && images[prev]) {
        return images[prev];
      }
      const next = targetIdx + offset;
      if (next < ANIMATION_CONFIG.totalFrames && states[next] === 2 && images[next]) {
        return images[next];
      }
    }

    return null;
  }, []);

  // Preload a single frame with off-thread asynchronous decoding
  const loadSingleFrame = useCallback((idx: number): Promise<HTMLImageElement | null> => {
    if (idx < 0 || idx >= ANIMATION_CONFIG.totalFrames) return Promise.resolve(null);
    if (loadStateRef.current[idx] === 2 && imagesRef.current[idx]) {
      return Promise.resolve(imagesRef.current[idx]);
    }
    if (loadStateRef.current[idx] === 1) {
      return Promise.resolve(null);
    }

    loadStateRef.current[idx] = 1;

    return new Promise((resolve) => {
      const img = new Image();
      img.src = getFrameUrl(idx);

      const onComplete = (loadedImg: HTMLImageElement) => {
        imagesRef.current[idx] = loadedImg;
        loadStateRef.current[idx] = 2;
        resolve(loadedImg);
      };

      const onError = () => {
        // Fallback to JPG format if WebP is unavailable
        const fallbackImg = new Image();
        fallbackImg.src = getFrameUrl(idx, true);
        fallbackImg.onload = () => onComplete(fallbackImg);
        fallbackImg.onerror = () => {
          loadStateRef.current[idx] = -1;
          resolve(null);
        };
      };

      img.onload = () => {
        // Off-thread asynchronous decode to avoid main-thread jank during drawImage
        if ("decode" in img) {
          img
            .decode()
            .then(() => onComplete(img))
            .catch(() => onComplete(img));
        } else {
          onComplete(img);
        }
      };

      img.onerror = onError;
    });
  }, []);

  // Prioritized loader: concentric expansion (+1, -1, +2, -2...) around current target frame
  const loadWindowAround = useCallback((centerIdx: number, radius = ANIMATION_CONFIG.windowRadius) => {
    const max = ANIMATION_CONFIG.totalFrames - 1;
    const start = Math.max(0, centerIdx - radius);
    const end = Math.min(max, centerIdx + radius);

    // 1. Center frame
    if (loadStateRef.current[centerIdx] === 0) {
      loadSingleFrame(centerIdx);
    }

    // 2. Concentric alternating expansion: immediate neighbors first
    for (let offset = 1; offset <= radius; offset++) {
      const forward = centerIdx + offset;
      if (forward <= end && loadStateRef.current[forward] === 0) {
        loadSingleFrame(forward);
      }
      const backward = centerIdx - offset;
      if (backward >= start && loadStateRef.current[backward] === 0) {
        loadSingleFrame(backward);
      }
    }
  }, [loadSingleFrame]);

  // Fast direct blit with optional sub-frame cross-fade
  const renderCanvasFrame = useCallback((frameA: number, frameB: number, blend: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = ctxRef.current || canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    if (!ctxRef.current) ctxRef.current = ctx;

    const { drawX, drawY, drawW, drawH } = layoutRef.current;
    if (drawW <= 0 || drawH <= 0) return;

    // 1. Get primary base frame
    const imgA = getNearestLoadedFrame(frameA);
    if (!imgA) return;

    // 2. Draw base frame at full opacity
    ctx.globalAlpha = 1.0;
    ctx.drawImage(imgA, drawX, drawY, drawW, drawH);

    // 3. Sub-frame adjacent cross-fade if frameB is ready and blend is visually meaningful
    if (frameB > frameA && blend > ANIMATION_CONFIG.subFrameBlendThreshold) {
      const isBLoaded = loadStateRef.current[frameB] === 2;
      const imgB = isBLoaded ? imagesRef.current[frameB] : null;

      if (imgB) {
        ctx.globalAlpha = blend;
        ctx.drawImage(imgB, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1.0;
      }
    }
  }, [getNearestLoadedFrame]);

  // Update canvas sizing & cover geometry strictly on resize (NEVER per frame)
  const updateLayout = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === 0 || height === 0) return;

    // Cap DPR to 1.5 to eliminate 4K pixel fill-rate stalls while retaining crispness
    const dpr = Math.min(window.devicePixelRatio || 1, ANIMATION_CONFIG.maxDPR);
    const canvasW = Math.floor(width * dpr);
    const canvasH = Math.floor(height * dpr);

    if (canvas.width !== canvasW || canvas.height !== canvasH) {
      canvas.width = canvasW;
      canvas.height = canvasH;
    }

    // Precalculate cover geometry in backing-store coordinate space
    const imgW = ANIMATION_CONFIG.nativeResolution.width;
    const imgH = ANIMATION_CONFIG.nativeResolution.height;
    const scale = Math.max(canvasW / imgW, canvasH / imgH);

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (canvasW - drawW) / 2;
    const drawY = (canvasH - drawH) / 2;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);

    layoutRef.current = {
      width,
      height,
      dpr,
      maxScroll,
      drawX,
      drawY,
      drawW,
      drawH,
    };

    // Cache context reference
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: false });
    }

    // Force redraw current state after resize
    const maxIdx = ANIMATION_CONFIG.totalFrames - 1;
    const frameFloat = Math.min(maxIdx, Math.max(0, displayProgressRef.current * maxIdx));
    const frameA = Math.floor(frameFloat);
    const frameB = Math.min(frameA + 1, maxIdx);
    const blend = frameFloat - frameA;
    renderCanvasFrame(frameA, frameB, blend);
    lastDrawnFrameARef.current = frameA;
    lastDrawnBlendRef.current = blend;
  }, [renderCanvasFrame]);

  // Main scroll calculation & ON-DEMAND RAF animation loop
  useEffect(() => {
    if (typeof window === "undefined") return;

    isReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Initialize layout geometry
    updateLayout();

    // Sync initial scroll progress on mount
    const initialScroll = window.scrollY || window.pageYOffset || 0;
    const maxScroll = layoutRef.current.maxScroll;
    const initialProgress = Math.min(1, Math.max(0, initialScroll / maxScroll));
    targetProgressRef.current = initialProgress;
    displayProgressRef.current = initialProgress;

    // 1. Preload frame 0 immediately and render it behind the Hero on mount
    loadSingleFrame(0).then((img0) => {
      if (img0) {
        setIsFirstFrameLoaded(true);
        renderCanvasFrame(0, 0, 0);
        lastDrawnFrameARef.current = 0;
        lastDrawnBlendRef.current = 0;
      }
    });

    // 2. Preload initial batch for smooth initial scrub
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
        if (loadStateRef.current[nextIdxToLoad] === 0) {
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

    // 4. ON-DEMAND RAF Render Loop:
    // Frame-rate independent exponential smoothing with adaptive fast-catchup & sub-frame cross-fade
    const renderLoop = (timestamp: number) => {
      const now = timestamp || performance.now();
      const lastTime = lastFrameTimeRef.current || now;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastFrameTimeRef.current = now;

      const target = targetProgressRef.current;
      const current = displayProgressRef.current;
      const diff = target - current;
      const absDiff = Math.abs(diff);

      let isSettled = false;

      if (absDiff > ANIMATION_CONFIG.settleThreshold) {
        // Adaptive lambda:
        // When diff is small (slow/subtle scroll), use baseLambda (18.0) for silky ~120ms settling
        // When diff is large (rapid fast scroll), scale up to fastCatchupLambda (36.0) for immediate response
        const ratio = Math.min(1, absDiff / 0.05);
        const effectiveLambda =
          ANIMATION_CONFIG.baseLambda +
          Math.pow(ratio, 0.75) * (ANIMATION_CONFIG.fastCatchupLambda - ANIMATION_CONFIG.baseLambda);

        // Frame-rate independent exponential smoothing
        const alpha = 1 - Math.exp(-effectiveLambda * dt);
        displayProgressRef.current += diff * alpha;

        // Keep loop running while interpolating toward target
        rafIdRef.current = requestAnimationFrame(renderLoop);
      } else {
        // Settled cleanly at target
        displayProgressRef.current = target;
        rafIdRef.current = null;
        lastFrameTimeRef.current = 0;
        isSettled = true;
      }

      // Convert continuous displayProgress to sub-frame float & adjacent integer indices
      const maxIdx = ANIMATION_CONFIG.totalFrames - 1;
      const frameFloat = Math.min(maxIdx, Math.max(0, displayProgressRef.current * maxIdx));
      const frameA = Math.floor(frameFloat);
      const frameB = Math.min(frameA + 1, maxIdx);
      const blend = frameFloat - frameA;

      // Only redraw when frameA changes, blend changes by more than threshold, or when settling
      const frameChanged = frameA !== lastDrawnFrameARef.current;
      const blendChanged = Math.abs(blend - lastDrawnBlendRef.current) >= ANIMATION_CONFIG.subFrameBlendThreshold;

      if (frameChanged || blendChanged || isSettled) {
        renderCanvasFrame(frameA, frameB, blend);
        lastDrawnFrameARef.current = frameA;
        lastDrawnBlendRef.current = blend;
      }
    };

    const scheduleRender = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    // 5. Global Full-Page Scroll Listener
    // Uses continuous float progress without quantization
    const handleScroll = () => {
      if (isReducedMotionRef.current) return;

      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const maxScroll = layoutRef.current.maxScroll;
      const rawProgress = Math.min(1, Math.max(0, currentScroll / maxScroll));

      targetProgressRef.current = rawProgress;
      scheduleRender();

      // Proactively prioritize loading frames around target position
      const targetFrame = Math.round(rawProgress * (ANIMATION_CONFIG.totalFrames - 1));
      if (Math.abs(targetFrame - lastPreloadFrameRef.current) >= 1) {
        lastPreloadFrameRef.current = targetFrame;
        loadWindowAround(targetFrame, ANIMATION_CONFIG.windowRadius);
      }
    };

    const handleResize = () => {
      updateLayout();
      scheduleRender();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial render trigger
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (idleHandlerId) {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleHandlerId);
        } else {
          clearTimeout(idleHandlerId);
        }
      }
    };
  }, [getNearestLoadedFrame, loadSingleFrame, loadWindowAround, renderCanvasFrame, updateLayout]);

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
});
