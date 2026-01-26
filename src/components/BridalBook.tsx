"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import PageFlip from "react-pageflip";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function BridalBook() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const bookRef = useRef<any>(null);

  // keep in sync with flippingTime
  const FLIP_MS = 1000;
  const SHADOW_PAD = 80; // space for the bottom shadow (tweak 60–120)

  // cache-busting once per mount
  const pdfFile = useMemo(() => `/taob-site.pdf?v=${Date.now()}`, []);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 1024;
      setIsMobile(mobile);

      let w: number, h: number;

      if (mobile) {
        w = vw - 48;
        h = w * 1.414;
      } else {
        h = vh * 0.9;
        w = (h / 1.414) * 2;

        if (w > vw * 0.85) {
          w = vw * 0.85;
          h = (w / 2) * 1.414;
        }
      }

      setDims({ w, h });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * BULLETPROOF SCROLL GUARD
   * - blocks user scroll input
   * - blocks browser "nudges" by forcing scrollY back every frame during flip
   */
  const guardRef = useRef<{
    active: boolean;
    lockedY: number;
    raf: number | null;
    timer: number | null;
    cleanup: (() => void) | null;
  }>({ active: false, lockedY: 0, raf: null, timer: null, cleanup: null });

  const stopGuard = useCallback(() => {
    const g = guardRef.current;
    if (!g.active) return;

    g.active = false;

    if (g.raf) cancelAnimationFrame(g.raf);
    if (g.timer) window.clearTimeout(g.timer);
    if (g.cleanup) g.cleanup();

    g.raf = null;
    g.timer = null;
    g.cleanup = null;
  }, []);

  const startGuard = useCallback((durationMs: number) => {
    const g = guardRef.current;

    // restart cleanly if spammed
    stopGuard();

    g.active = true;
    g.lockedY = window.scrollY;

    // Prevent *input* scroll (wheel, touch, keys)
    const prevent = (e: Event) => {
      e.preventDefault();
    };

    const preventKeys = (e: KeyboardEvent) => {
      // block keys that scroll the page
      const keys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (keys.includes(e.key)) e.preventDefault();
    };

    // NOTE: must be non-passive to preventDefault
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    window.addEventListener("keydown", preventKeys, { passive: false });

    // Stop scroll anchoring / overscroll bounce while flipping
    const html = document.documentElement;
    const prevOverscroll = html.style.overscrollBehaviorY;
    const prevOverflowAnchor = (document.body.style as any).overflowAnchor;

    html.style.overscrollBehaviorY = "none";
    (document.body.style as any).overflowAnchor = "none";

    g.cleanup = () => {
      window.removeEventListener("wheel", prevent as any);
      window.removeEventListener("touchmove", prevent as any);
      window.removeEventListener("keydown", preventKeys as any);
      html.style.overscrollBehaviorY = prevOverscroll;
      (document.body.style as any).overflowAnchor = prevOverflowAnchor;
    };

    // Hard-enforce scroll position every frame
    const tick = () => {
      if (!g.active) return;

      // If anything nudged us, snap back immediately.
      if (window.scrollY !== g.lockedY) {
        window.scrollTo({ top: g.lockedY, left: 0, behavior: "auto" });
      }

      g.raf = requestAnimationFrame(tick);
    };

    g.raf = requestAnimationFrame(tick);

    // Auto-release after duration
    g.timer = window.setTimeout(() => {
      stopGuard();
    }, Math.max(0, durationMs));
  }, [stopGuard]);

  useEffect(() => {
    return () => {
      stopGuard();
    };
  }, [stopGuard]);

  // PageFlip event: treat as "flip is happening now"
  const onFlip = useCallback(() => {
    // Guard the entire flip window + a little extra buffer for late layout/focus nudges
    startGuard(FLIP_MS + 250);
  }, [startGuard]);

  if (dims.h === 0) return null;

  const flipWidth = isMobile ? Math.floor(dims.w) : Math.floor(dims.w / 2);
  const flipHeight = Math.floor(dims.h);

  return (
    <div className="w-full flex justify-center">
    <div
      className="w-full flex items-center justify-center"
      style={{
        // give the shadow room to exist (prevents “clipped panel” look)
        height: flipHeight + SHADOW_PAD,
        paddingBottom: SHADOW_PAD,

        // IMPORTANT: allow shadows to spill
        overflow: "visible",

        // keep scroll anchoring disabled (fine)
        overflowAnchor: "none",

        // IMPORTANT: do NOT paint-contain (it clips shadows)
        // contain: "layout paint size",
        contain: "layout size", // or just delete this line entirely
      }}
    >
        <div className="relative bg-white shadow-[0_80px_120px_-40px_rgba(0,0,0,0.08)]">
          <Document
            file={pdfFile}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="font-serif italic text-stone-300 py-48 tracking-[0.4em] text-xs">
                Unveiling Portfolio
              </div>
            }
          >
            {numPages && (
              /* @ts-ignore */
              <PageFlip
                ref={bookRef}
                width={flipWidth}
                height={flipHeight}
                size="fixed"
                showCover={true}
                usePortrait={isMobile}
                flippingTime={FLIP_MS}
                maxShadowOpacity={0.12}
                className="luxe-flip-engine"
                drawShadow={true}
                clickEventForward={false}
                useMouseEvents={true}
                swipeDistance={30}
                style={{ backgroundColor: "#ffffff" }}
                onFlip={onFlip}
              >
                {[...Array(numPages).keys()].map((p) => (
                  <div key={p} className="bg-white overflow-hidden" tabIndex={-1}>
                    <div className="relative bg-white w-full h-full">
                      <Page
                        pageNumber={p + 1}
                        height={flipHeight}
                        width={isMobile ? dims.w : dims.w / 2}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        devicePixelRatio={Math.min(window.devicePixelRatio, 2)}
                        className="bg-white"
                        loading={null}
                      />

                      {!isMobile && (
                        <div
                          className={`absolute inset-y-0 ${
                            p % 2 === 0 ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
                          } from-black/[0.04] to-transparent w-24 pointer-events-none z-10`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </PageFlip>
            )}
          </Document>
        </div>

        <style jsx global>{`
          html,
          body {
            overflow-anchor: none;
          }

          .luxe-flip-engine {
            outline: none !important;
            -webkit-tap-highlight-color: transparent;
          }

          .luxe-flip-engine *:focus {
            outline: none !important;
          }

          .react-pdf__Page__canvas {
            background-color: white !important;
            display: block !important;
          }
        `}</style>
      </div>
    </div>
  );
}
