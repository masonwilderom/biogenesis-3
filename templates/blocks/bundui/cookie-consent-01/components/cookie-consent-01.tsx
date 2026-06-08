import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  return (
    <>
      <div className="bg-background absolute start-0 end-0 top-0 w-full">
        <div className="items-center px-4 py-4 md:flex">
          <div className="mb-5 px-3 md:mb-0 md:flex-1">
            <p className="text-center text-xs md:pr-12 md:text-left">
              We and selected partners and related companies, use cookies and similar technologies
              as specified in our Cookies Policy. You agree to consent to the use of these
              technologies by clicking Accept, or by continuing to browse this website. You can
              learn more about how we use cookies and set cookie preferences in Settings.
            </p>
          </div>
          <div className="space-x-2 text-center">
            <Button size="sm" variant="outline">
              Cookie settings
            </Button>
            <Button size="sm">Accept cookies</Button>
          </div>
        </div>
      </div>

      {/* fake content */}
      <div className="bg-muted/50 h-60"></div>
    </>
  );
}
