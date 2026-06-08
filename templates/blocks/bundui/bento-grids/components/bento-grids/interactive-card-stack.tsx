"use client";

import { useState } from "react";

const cards = [
  // copy not visible
  {
    id: 1,
    logo: "/openai-white.svg",
    name: "Grok 3",
    contextWindow: "128k"
  },
  // copy not visible
  {
    id: 2,
    logo: "/anthropic-white.svg",
    name: "Grok 3",
    contextWindow: "128k"
  },
  {
    id: 3,
    logo: "/grok-white.svg",
    name: "Grok 3 Mini Beta",
    contextWindow: "131k"
  },
  {
    id: 4,
    logo: "/openai-white.svg",
    name: "GPT 4.5 Preview",
    contextWindow: "128k"
  },
  {
    id: 5,
    logo: "/anthropic-white.svg",
    name: "Grok 3",
    contextWindow: "128k"
  },
  // copy not visible
  {
    id: 6,
    logo: "/grok-white.svg",
    name: "Grok 3",
    contextWindow: "128k"
  },
  // copy not visible
  {
    id: 7,
    logo: "/openai-white.svg",
    name: "Grok 3",
    contextWindow: "128k"
  },
  // copy not visible
  {
    id: 8,
    logo: "/anthropic-white.svg",
    name: "Grok 3",
    contextWindow: "128k"
  }
];

const CARD_HEIGHT = 70; // px, adjust to match your h-16 + gap

function HoverTranslateTwo() {
  const [active, setActive] = useState(2); // Start with the middle card
  const [hovered, setHovered] = useState(false);

  // on hover, move to next card (if possible)
  const handleMouseEnter = () => {
    setHovered(true);
    if (active < cards.length - 1) setActive(active + 1);
  };

  // on leave, return to previous card
  const handleMouseLeave = () => {
    setHovered(false);
    if (active > 0) setActive(active - 1);
  };

  const containerHeight = 350;
  // grab middle pos
  const middlePos = containerHeight / 2;
  // center the card in the middle of container, but then move up a bit
  const translateY = middlePos - active * CARD_HEIGHT - 35;

  return (
    <>
      <div
        className="relative flex flex-col items-center overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <div
          className="-mt-10 flex w-full flex-col items-center justify-center gap-4 overflow-visible transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateY(${translateY}px)`,
            backfaceVisibility: "hidden"
          }}>
          {cards.map((card, idx) => {
            const isCenter = idx === active;
            return (
              <div
                key={card.id}
                className={`flex h-16 w-[275px] items-center justify-between gap-4 rounded-xl pr-4 pl-3.5 text-sm transition duration-300 ease-in-out ${
                  isCenter ? "z-[99 scale-[1.00] blur-none" : "scale-95 opacity-60 blur-[2px]"
                } `}
                style={{
                  background:
                    "radial-gradient(65.62% 65.62% at 50% 50%, \
                  rgba(0, 0, 255, 0.32) 0%, \
                  rgba(0, 0, 255, 0) 100%), \
                  linear-gradient( \
                  rgba(0, 128, 255, 0.12) 0%, \
                  rgba(255,255,255,0.10) 100%), \
                  rgba(0, 0, 255, 0.56)",

                  boxShadow:
                    "rgba(0, 128, 255, 0.06) 0px -12px 16px 0px inset, \
                         rgba(0, 128, 255, 0.16) 0px 4px 16px 0px inset, \
                         rgba(0, 128, 255, 0.12) 0px 0.75px 0.25px 0px inset, \
                         rgba(0, 128, 255, 0.32) 0px 0.25px 0.25px 0px inset, \
                          rgba(0, 0, 255, 0.06) 0px 2px 16px 0px, \
                          rgba(0, 0, 255, 0.06) 0px 23px 14px 0px, \
                          rgba(0, 0, 255, 0.19) 0px 10px 10px 0px, \
                          rgba(0, 0, 255, 0.26) 0px 3px 6px 0px, \
                          rgba(0, 0, 255, 0.40) 0px 0px 0px 0.75px"
                }}>
                <div className="w-full">
                  <div className="flex w-full items-center justify-between gap-3 pr-2 pl-1">
                    <div className="flex items-center gap-2">
                      <img src={card.logo} alt={card.name} width={20} height={20} />
                      <span className="-ml-0.5 font-medium text-white">{card.name}</span>
                    </div>
                    <span className="font-medium text-white">{card.contextWindow} Context</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* blurred gradient overlay at the top */}
        <div
          className="pointer-events-none absolute -top-12 left-0 z-20 w-full bg-gradient-to-b from-white to-transparent pt-[100px] pb-[80px]"
          // done to get rid of random white line
          style={{ filter: "blur(4px)" }}
        />
      </div>
    </>
  );
}

export default HoverTranslateTwo;
