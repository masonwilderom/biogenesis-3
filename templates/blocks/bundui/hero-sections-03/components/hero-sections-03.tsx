import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/components/ui/navigation-menu";

const navigationLinks = [
  { href: "#", label: "Home", active: true },
  { href: "#", label: "Features" },
  { href: "#", label: "Pricing" },
  { href: "#", label: "About" }
];

const Logo = () => {
  return (
    <Link href="#" className="flex items-center space-x-2">
      <img src="/logo.svg" className="size-8 dark:invert" alt="bundui logo" />
      <span className="text-2xl font-bold">Bundui</span>
    </Link>
  );
};

export default function HeroSection() {
  return (
    <>
      <header className="border-b px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <Button className="group size-8 md:hidden" variant="ghost" size="icon">
                  <svg
                    className="pointer-events-none"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 12L20 12"
                      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-36 p-1 md:hidden">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink
                          href={link.href}
                          className="py-1.5"
                          active={link.active}>
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-primary hover:text-primary/90">
                <Logo />
              </a>
              {/* Navigation menu */}
              <NavigationMenu className="max-md:hidden">
                <NavigationMenuList className="gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        active={link.active}
                        href={link.href}
                        className="text-muted-foreground hover:text-primary py-1.5 font-medium">
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <a href="#">Sign In</a>
            </Button>
            <Button asChild size="sm" className="text-sm">
              <a href="#">Get Started</a>
            </Button>
          </div>
        </div>
      </header>
      <section className="py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <header className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <Badge variant="outline">
                🚀 Launch Faster
                <ArrowUpRight />
              </Badge>
              <h1 className="font-heading my-4 text-4xl text-balance md:text-5xl lg:leading-14">
                All-in-One Platform for Managing Your SaaS
              </h1>
              <p className="text-muted-foreground mb-8 text-balance lg:text-lg">
                Streamline operations, track metrics, and scale your SaaS business with ease.
                Everything you need, in one powerful dashboard.
              </p>
              <div className="flex justify-center gap-2">
                <Button asChild>
                  <Link href="https://app.yoursaas.com/signup">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="https://app.yoursaas.com/demo">Request a Demo</Link>
                </Button>
              </div>
            </header>
            <img
              src="https://images.unsplash.com/photo-1748723594319-142e211b46a9?q=80&w=700&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Dashboard interface of the SaaS platform"
              className="aspect-square w-full rounded-md object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
