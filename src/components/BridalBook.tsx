"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import PageFlip from 'react-pageflip';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function BridalBook() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const pdfFile = useMemo(() => `/taob-site.pdf?v=${Date.now()}`, []);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 1024;
      setIsMobile(mobile);

      let w, h;
      if (mobile) {
        // Pushes away from mobile edges by taking parent padding into account
        w = Math.min(vw - 64, 600); 
        h = w * 1.414;
      } else {
        // Desktop: High-impact scale
        // Uses a 1.414 (A4) aspect ratio for the spread
        w = Math.min(vw * 0.85, 1600); 
        h = (w / 2) * 1.414;

        // If it's too tall for the laptop screen, scale it down slightly
        if (h > vh * 0.85) {
          h = vh * 0.85;
          w = (h / 1.414) * 2;
        }
      }

      setDims({ w, h });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (dims.h === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full transition-all duration-700">
      <div className="relative bg-white shadow-[0_50px_100px_-30px_rgba(0,0,0,0.12)]">
        <Document 
          file={pdfFile} 
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="font-serif italic text-stone-300 py-40 tracking-[0.3em] text-sm animate-pulse">Unveiling the Portfolio</div>}
        >
          {numPages && (
            /* @ts-ignore */
            <PageFlip
              width={isMobile ? Math.floor(dims.w) : Math.floor(dims.w / 2)}
              height={Math.floor(dims.h)}
              size="fixed"
              showCover={true}
              usePortrait={isMobile}
              flippingTime={1200}
              maxShadowOpacity={0.1}
              className="luxe-book"
              drawShadow={true}
              style={{ backgroundColor: "white" }}
            >
              {[...Array(numPages).keys()].map((p) => (
                <div key={p} className="bg-white overflow-hidden border-none outline-none">
                  <div className="relative bg-white w-full h-full">
                    <Page 
                      pageNumber={p + 1} 
                      height={dims.h}
                      width={isMobile ? dims.w : dims.w / 2}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      devicePixelRatio={Math.min(window.devicePixelRatio, 2)}
                      className="bg-white block"
                    />
                    
                    {/* Spine Shadow */}
                    {!isMobile && (
                      <div className={`absolute inset-y-0 ${p % 2 === 0 ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-black/[0.04] to-transparent w-24 pointer-events-none z-10`} />
                    )}
                  </div>
                </div>
              ))}
            </PageFlip>
          )}
        </Document>
      </div>

      <style jsx global>{`
        /* Remove any default canvas borders and force white background */
        .react-pdf__Page__canvas {
          background-color: white !important;
          display: block !important;
          margin: 0 auto;
        }
        .stf__parent {
          background: transparent !important;
        }
        .luxe-book {
           background-color: white;
        }
      `}</style>
    </div>
  );
}