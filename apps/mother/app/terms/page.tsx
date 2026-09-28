import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This is a placeholder. Final legal copy has not been drafted yet — do not treat this page
        as a real terms of service until it is replaced.
      </p>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <p>
          By creating a StorePulse account, you agree to use the platform to operate a legitimate
          business storefront and to keep your account credentials secure.
        </p>
        <p>
          Subscription fees are billed monthly per the plan you select at signup. You may cancel
          at any time; StorePulse will confirm cancellation terms with you directly during this
          early phase.
        </p>
        <p>
          Questions about these terms can be sent to
          {" "}
          <a href="mailto:hello@storepulse.com">hello@storepulse.com</a>.
        </p>
      </div>
    </main>
  );
}
