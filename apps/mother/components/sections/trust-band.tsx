import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";

const stats = [
  { value: 75, suffix: "%", label: "of transactions in Bangladesh are still cash-on-delivery" },
  { value: 40, suffix: "%+", label: "of online shoppers discover products through social media" },
];

export function TrustBand() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your real competitor isn&rsquo;t another store. It&rsquo;s a notebook and a
            Facebook inbox.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Most sellers already run a real business — it just lives in DMs, screenshots, and a
            notebook full of orders. StorePulse organizes what you&rsquo;re already doing, instead
            of asking you to start over with a generic storefront.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.12}>
              <CountUp
                value={stat.value}
                suffix={stat.suffix}
                className="font-display text-5xl font-bold text-primary"
              />
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
