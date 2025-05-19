import { Leaf, BarChart3, Zap } from "lucide-react";

const features = [
  {
    name: "Unmatched Precision",
    description:
      "Analyze your soil with centimeter-level accuracy using our next-generation sensors.",
    icon: Leaf,
  },
  {
    name: "Fast Analysis",
    description:
      "Get detailed results in real-time while our smart tractor scans your fields.",
    icon: Zap,
  },
  {
    name: "Cost Optimization",
    description:
      "Reduce your operating costs with intelligent management based on precise data.",
    icon: BarChart3,
  },
];

const Features = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Benefits
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            A Complete Solution for Modern Agriculture
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group relative pl-16 transition-all duration-300 hover:translate-y-[-4px]"
              >
                <dt className="text-base font-semibold leading-7">
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                    <feature.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-foreground/80">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features;