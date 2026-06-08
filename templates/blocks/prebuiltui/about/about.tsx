"use client";

import React from "react";

export default function Example() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16">
      {/* soft glow background */}
      <div
        className="pointer-events-none absolute -top-64 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#FBFFE1] blur-[300px] -z-10"
        aria-hidden
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* header */}
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">About our apps</h1>
        <p className="mt-2 text-sm md:text-base text-slate-500">
          A visual collection of our most recent works — each piece crafted with
          intention, emotion and style.
        </p>
      </header>

      {/* grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/flashEmoji.png"
          title="Lightning-Fast Performance"
          desc="Built with speed — minimal load times and optimized."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/colorsEmoji.png"
          title="Beautifully Designed Components"
          desc="Modern, pixel-perfect UI components ready for any project."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/puzzelEmoji.png"
          title="Plug-and-Play Integration"
          desc="Simple setup with support for React, Next.js and Tailwind CSS."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/bookEmoji.png"
          title="Clear & Comprehensive"
          desc="Get started fast with usage examples, live previews and code."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/boxEmoji.png"
          title="Fully Customizable"
          desc="Easily adapt styles, colors and layout to match your brand or product."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/brainEmoji.png"
          title="Accessibility First"
          desc="Built with WCAG standards in mind to ensure inclusive experiences."
        />
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-xl border border-slate-200/60 bg-white/50 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="size-10 shrink-0 rounded bg-indigo-50 border border-indigo-200 p-2">
        <img src={icon} alt="" className="h-full w-full object-contain" />
      </div>
      <div>
        <h3 className="text-base font-medium text-slate-700">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );
}