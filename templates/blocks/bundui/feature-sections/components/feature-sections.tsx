import { ArrowUp10Icon, CloudyIcon, FingerprintIcon, LockOpenIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    name: "Push to deploy",
    description:
      "Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.",
    icon: CloudyIcon
  },
  {
    name: "SSL certificates",
    description:
      "Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.",
    icon: LockOpenIcon
  },
  {
    name: "Simple queues",
    description:
      "Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.",
    icon: ArrowUp10Icon
  },
  {
    name: "Advanced security",
    description:
      "Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.",
    icon: FingerprintIcon
  }
];

export default function FeatureSection() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mx-auto max-w-2xl lg:text-center">
          <Badge variant="outline" className="text-indigo-600">
            Deploy faster
          </Badge>
          <h3 className="font-heading mt-4 text-4xl sm:text-5xl lg:text-balance">
            Everything you need to deploy your app
          </h3>
          <p className="text-muted-foreground mt-6 text-lg">
            Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget
            egestas a elementum pulvinar et feugiat blandit at. In mi viverra elit nunc.
          </p>
        </header>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold">
                  <div className="bg-primary absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg">
                    <feature.icon aria-hidden="true" className="text-primary-foreground size-6" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="text-muted-foreground mt-2 text-base/7">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
