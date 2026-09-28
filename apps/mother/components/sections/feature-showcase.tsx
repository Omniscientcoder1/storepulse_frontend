import {
  AiSparkIcon,
  InboxIcon,
  PaymentIcon,
  StorefrontIcon,
} from "@/components/illustrations/feature-icons";
import { Reveal } from "@/components/reveal";

const features = [
  {
    icon: StorefrontIcon,
    title: "A storefront that's actually yours",
    description:
      "Pick a template built for your category — fashion, beauty, electronics, home & kitchen, or food — and go live on your own branded subdomain.",
    span: "md:col-span-3",
  },
  {
    icon: InboxIcon,
    title: "One inbox for every DM",
    description: "WhatsApp and Messenger messages land in a single dashboard, next to the order they belong to.",
    span: "md:col-span-2",
  },
  {
    icon: PaymentIcon,
    title: "Cash-on-delivery or online",
    description: "Record COD by hand or accept real online payment through SSLCommerz — your call, per order.",
    span: "md:col-span-2",
  },
  {
    icon: AiSparkIcon,
    title: "AI that drafts, you approve",
    description: "AI-suggested replies and product descriptions speed you up — nothing sends without you.",
    span: "md:col-span-3",
  },
];

export function FeatureShowcase() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your storefront needs. Nothing it doesn&rsquo;t.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 0.08} className={feature.span}>
                <div className="h-full rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
                  <Icon />
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
