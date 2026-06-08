import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Lovable, ChatGPT, Gemini, Grok, Claude, KlingAI } from "./components/logos";

export default function IntegrationsSection() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl text-balance md:text-4xl lg:leading-11">
            Integrate effortlessly with your favorite platforms
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-balance">
            Connect with leading tools and services to streamline and enhance your workflow.
          </p>
        </header>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <IntegrationCard
            title="Lovable"
            description="An AI design assistant that helps you create interfaces and visuals with an intuitive and friendly approach."
            logo={<Lovable />}
          />

          <IntegrationCard
            title="ChatGPT"
            description="A conversational AI developed by OpenAI that can understand and generate human-like text across countless topics."
            logo={<ChatGPT />}
          />

          <IntegrationCard
            title="Gemini"
            description="Google’s multimodal AI model designed to reason across text, images, code, and more."
            logo={<Gemini />}
          />

          <IntegrationCard
            title="Grok"
            description="An AI chatbot by xAI (Elon Musk’s company) that provides witty, real-time insights integrated with X (formerly Twitter)."
            logo={<Grok />}
          />

          <IntegrationCard
            title="Claude"
            description="An AI assistant by Anthropic focused on helpful, honest, and harmless conversations."
            logo={<Claude />}
          />

          <IntegrationCard
            title="Kling AI"
            description="A video-generation AI capable of creating realistic, dynamic scenes from text prompts."
            logo={<KlingAI />}
          />
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  title,
  description,
  logo,
  link = "#"
}: {
  title: string;
  description: string;
  logo: React.ReactNode;
  link?: string;
}) => {
  return (
    <Card className="pb-0 shadow-none">
      <CardContent>
        <div className="relative">
          <div className="mb-6 *:size-10">{logo}</div>

          <div className="space-y-2">
            <h3 className="text-base font-medium">{title}</h3>
            <p className="text-muted-foreground text-sm sm:line-clamp-2">{description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t border-dashed px-6 py-4!">
        <Button asChild variant="outline" className="w-full justify-between" size="sm">
          <Link href={link}>
            Learn More
            <ChevronRight className="!size-3.5 opacity-50" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
