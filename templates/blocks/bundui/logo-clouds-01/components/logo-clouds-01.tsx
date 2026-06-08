import { MarqueeEffect } from "@/components/marquee-effect";
import { Badge } from "@/components/ui/badge";

const logos = [
  {
    name: "OpenAi",
    img: "https://cdn.worldvectorlogo.com/logos/openai-logo-1.svg"
  },
  {
    name: "Microsoft Copilot",
    img: "https://cdn.worldvectorlogo.com/logos/microsoft-copilot-logo.svg"
  },
  {
    name: "Deepseek Ai",
    img: "https://cdn.worldvectorlogo.com/logos/deepseek-ai-seeklogo.svg"
  },
  {
    name: "Gemini",
    img: "https://cdn.worldvectorlogo.com/logos/gemini-ai.svg"
  },
  {
    name: "Grok",
    img: "https://cdn.worldvectorlogo.com/logos/grok-3.svg"
  },
  {
    name: "Lovable",
    img: "https://cdn.worldvectorlogo.com/logos/lovable.svg"
  }
];

export default function LogoClouds() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-3xl px-4">
        {logos.length > 0 && (
          <MarqueeEffect className="mask-r-from-80% mask-l-from-80%" gap={50}>
            {logos.map((logo) => (
              <div className="flex items-center">
                <img src={logo.img} className="w-[130px]" alt={logo.name} />
              </div>
            ))}
          </MarqueeEffect>
        )}
      </div>
    </section>
  );
}
