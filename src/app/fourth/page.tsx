"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const BridalBook = dynamic(() => import("@/components/BridalBook"), {
  ssr: false,
  loading: () => (
    <div className="h-[80vh] w-full flex items-center justify-center font-serif italic text-stone-300 tracking-[0.3em] uppercase text-xs">
      Opening Portfolio...
    </div>
  ),
});

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-[#fcfbf9]">
      {/* TOP NAV CTA */}
      <div className="w-full max-w-screen-2xl px-8 md:px-24 pt-10 flex justify-center">
       
      </div>

      {/* 1. HERO HEADER */}
      <header className="w-full max-w-screen-2xl pt-[12vh] pb-[10vh] px-8 md:px-24 flex flex-col items-center text-center space-y-12">
      <Link
          href="/fifth"
          className="group inline-flex items-center gap-3 border border-stone-300 px-6 py-3 rounded-full text-[11px] md:text-[12px] uppercase tracking-[0.4em] text-stone-600 hover:text-stone-900 hover:border-stone-500 transition-all duration-300"
        >
          Take me to the next page
          <span className="group-hover:translate-x-1 transition-transform duration-300">
            →
          </span>
        </Link>
        <span className="font-sans text-[11px] md:text-[13px] uppercase tracking-[1em] text-stone-400 font-light">
          Private Boutique Experience
        </span>

        <h1 className="font-serif text-6xl md:text-[160px] font-light tracking-tighter leading-none py-4 text-stone-900">
          Bride <span className="italic font-normal opacity-80">or</span> Die
        </h1>

        <div className="flex items-center justify-center gap-12 w-full max-w-3xl">
          <div className="h-px flex-1 bg-stone-200" />
          <p className="font-serif italic text-stone-400 text-lg md:text-2xl tracking-[0.3em] lowercase">
            London &bull; Paris &bull; Cairns
          </p>
          <div className="h-px flex-1 bg-stone-200" />
        </div>
      </header>

      {/* 2. STAGE */}
      <section className="w-full flex justify-center py-[10vh] overflow-visible">
        <div className="w-full max-w-screen-2xl px-6 md:px-20">
          <BridalBook />
        </div>
      </section>

      {/* 3. FOOTER */}
      <footer className="w-full flex flex-col items-center pt-[10vh] pb-[20vh] text-stone-400">
        <div className="w-px h-32 bg-gradient-to-b from-stone-200 to-transparent mb-12" />
        <p
          className="font-sans text-[10px] uppercase opacity-60 text-center"
          style={{
            letterSpacing: "0.8em",
            paddingLeft: "0.4em", // optical centering compensation
          }}
        >
          Crafted for the modern bride
        </p>
      </footer>

      <style jsx global>{`
        h1,
        .font-serif {
          font-family: var(--font-playfair), serif !important;
        }
        p,
        span,
        .font-sans {
          font-family: var(--font-inter), sans-serif !important;
        }

        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #fcfbf9;
        }
        ::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
