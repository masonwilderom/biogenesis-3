import { Button } from "@/components/ui/button";

export default function PromotionalCard() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center rounded-2xl bg-[url('https://images.unsplash.com/photo-1754357906539-7ae638a49740?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1426')] py-12 text-center max-md:mx-2 max-md:px-2 lg:py-20">
        <div className="mb-6 max-w-2xl space-y-4">
          <h1 className="font-heading text-3xl text-balance text-black md:text-4xl">
            Empower Your Sales & Marketing with a Next-Gen AI Workforce
          </h1>
          <p className="text-black md:text-lg">
            Leverage AI Agents for real-time calling and unified multi-channel engagement,
            optimizing customer interactions at scale.
          </p>
        </div>
        <Button>Get Started</Button>
      </div>
    </section>
  );
}
