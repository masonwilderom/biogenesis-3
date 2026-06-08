import { Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 lg:py-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full px-2 py-1">
            <Sun className="size-4" />
            2.0 version is here
          </Badge>

          <div className="mx-auto max-w-xl space-y-6 text-center lg:mx-0 lg:text-start">
            <h1 className="text-5xl lg:text-6xl">
              <span>Welcome to the</span> <br />
              <span className="text-muted-foreground italic">innovation</span>
              <span className="text-muted-foreground not-italic"> oasis</span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Step into our innovation oasis, where groundbreaking ideas bloom, and every click is a
              step into a world of endless possibilities.
            </p>
          </div>

          <div className="flex justify-center gap-4 lg:justify-start">
            <Button size="lg" className="rounded-full">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 space-y-6">
          <div className="space-y-6">
            <Card className="mt-8 overflow-hidden border-none p-0 shadow-none">
              <img
                src="https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Mobile app"
                className="aspect-4/3 w-full object-cover"
              />
            </Card>
            <Card className="bg-muted aspect-4/3 border-none shadow-none">
              <CardContent className="flex h-full flex-col justify-end">
                <div>
                  <div className="mb-2 text-4xl">27k+</div>
                  <div className="text-muted-foreground">Raised by startups</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="-mb-8 space-y-6">
            <Card className="bg-muted aspect-4/3 border-none shadow-none">
              <CardContent className="flex h-full flex-col justify-end">
                <div>
                  <div className="mb-2 text-4xl">$14B</div>
                  <div className="text-muted-foreground">Funds & Syndicates</div>
                </div>
              </CardContent>
            </Card>
            <Card className="aspect-4/3 border-none bg-amber-50 shadow-none dark:bg-amber-950">
              <CardContent className="flex h-full flex-col justify-end">
                <div className="mb-2 text-4xl">80k</div>
                <div className="text-muted-foreground mb-4">Active members</div>
                <div className="flex -space-x-2">
                  <Avatar className="border-background border-2">
                    <AvatarImage src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100" />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <Avatar className="border-background border-2">
                    <AvatarImage src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100" />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                  <Avatar className="border-background border-2">
                    <AvatarImage src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100" />
                    <AvatarFallback>U3</AvatarFallback>
                  </Avatar>
                  <Avatar className="border-background border-2">
                    <AvatarImage src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100&h=100" />
                    <AvatarFallback>U4</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
