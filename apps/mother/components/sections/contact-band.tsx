import { Button } from "@storepulse/ui/components/button";

import { Reveal } from "@/components/reveal";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "https://wa.me/";

export function ContactBand() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Questions before you start?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Message us directly — a real person will get back to you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:hello@storepulse.com">Email us</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
