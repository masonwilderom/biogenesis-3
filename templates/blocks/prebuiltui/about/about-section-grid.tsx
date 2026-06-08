"use client";

import React from "react";

export default function Example() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <section className="relative min-h-screen flex items-center justify-center px-6 py-16">
        {/* soft glow background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="h-[520px] w-[520px] rounded-full blur-[300px] bg-[#FBFFE1]" />
        </div>

        <div className="w-full max-w-5xl">
          {/* heading block */}
          <header className="text-center mx-auto max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-semibold text-slate-900 leading-tight">
              About our apps
            </h1>
            <p className="mt-3 text-sm md:text-base text-slate-600 text-pretty">
              A visual collection of our most recent works — each piece crafted with intention, emotion and style.
            </p>
          </header>

          {/* features grid */}
          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="rounded-xl border border-slate-200 p-6 md:p-8 bg-white/60 backdrop-blur">
              <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                <img
                  src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/flashEmoji.png"
                  alt="Fast performance icon"
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="mt-5 text-base md:text-lg font-medium text-slate-700">
                Lightning-Fast Performance
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Built with speed — minimal load times and optimized.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 md:p-8 bg-white/60 backdrop-blur">
              <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                <img
                  src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/colorsEmoji.png"
                  alt="Design colors icon"
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="mt-5 text-base md:text-lg font-medium text-slate-700">
                Beautifully Designed Components
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Modern, pixel-perfect UI components ready for any project.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 md:p-8 bg-white/60 backdrop-blur">
              <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                <img
                  src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/puzzelEmoji.png"
                  alt="Puzzle integration icon"
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="mt-5 text-base md:text-lg font-medium text-slate-700">
                Plug-and-Play Integration
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Simple setup with support for React, Next.js, and Tailwind CSS.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}