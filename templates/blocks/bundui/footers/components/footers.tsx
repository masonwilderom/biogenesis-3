import { Dumbbell, SendIcon } from "lucide-react";
import Link from "next/link";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";

const Logo = () => {
  return (
    <Link href="#" className="flex items-center space-x-2">
      <img src="/logo.svg" className="size-8 dark:invert" alt="bundui logo" />
      <span className="text-2xl font-bold">Bundui</span>
    </Link>
  );
};

export default function FooterSection() {
  return (
    <footer className="py-12">
      <div className="container mx-auto space-y-6 px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              Transform your body, transform your life. Join the FitCore family today.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Programs</h3>
            <ul className="[&_li_a]:text-muted-foreground [&_li_a]:hover:text-foreground space-y-2 [&_li_a]:block [&_li_a]:text-sm [&_li_a]:transition-colors [&_li_a]:hover:underline">
              <li>
                <Link href="/programs">Strength Training</Link>
              </li>
              <li>
                <Link href="/programs">HIIT Classes</Link>
              </li>
              <li>
                <Link href="/programs">Yoga & Wellness</Link>
              </li>
              <li>
                <Link href="/programs">Personal Training</Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="[&_li_a]:text-muted-foreground [&_li_a]:hover:text-foreground space-y-2 [&_li_a]:block [&_li_a]:text-sm [&_li_a]:transition-colors [&_li_a]:hover:underline">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/trainers">Our Trainers</Link>
              </li>
              <li>
                <Link href="/membership">Membership</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-muted-foreground text-sm">
              Stay updated with fitness tips and offers.
            </p>
            <div className="flex space-x-2">
              <InputGroup>
                <InputGroupInput type="email" placeholder="Your email" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton variant="secondary">
                    <span className="hidden lg:inline">Subscribe</span>
                    <SendIcon className="inline lg:hidden" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
        <Separator className="lg:mt-10" />
        <div className="text-muted-foreground text-center">
          <div className="text-xs">
            &copy; {new Date().getFullYear()} Bundui. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
