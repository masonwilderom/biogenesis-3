"use client";

import React from "react";

export default function Example() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
      
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <h1 className="text-3xl md:text-4xl font-semibold max-w-2xl">
        About our apps
      </h1>

      <p className="text-sm md:text-base text-slate-500 mt-3 max-w-lg">
        A visual collection of our most recent works — each piece crafted with
        intention, emotion and style.
      </p>

      <div className="mt-10 max-w-5xl flex flex-col md:flex-row items-center justify-center gap-10">
        <img
          className="w-full max-w-sm rounded-xl"
          src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop"
          alt="App preview"
        />

        <div className="text-left md:text-left max-w-md">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Our Latest Features
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-2">
            Ship Beautiful Frontends Without the Overhead — Customizable,
            Scalable and Developer-Friendly UI Components.
          </p>

          <div className="flex flex-col gap-8 mt-6">
            <FeatureItem
              img="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/flashEmoji.png"
              title="Lightning-Fast Performance"
              desc="Built with speed — minimal load times and optimized."
            />
            <FeatureItem
              img="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/colorsEmoji.png"
              title="Beautifully Designed Components"
              desc="Modern, pixel-perfect UI components ready for any project."
            />
            <FeatureItem
              img="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/puzzelEmoji.png"
              title="Plug-and-Play Integration"
              desc="Simple setup with support for React, Next.js and Tailwind CSS."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  img,
  title,
  desc,
}: {
  img: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="size-10 flex items-center justify-center bg-indigo-50 border border-indigo-200 rounded">
        <img src={img} alt="" className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-medium text-slate-600">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}