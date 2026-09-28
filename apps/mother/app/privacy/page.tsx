import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This is a placeholder policy. Final legal copy has not been drafted yet — do not treat
        this page as a real privacy policy until it is replaced.
      </p>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <p>
          StorePulse collects the information you provide when creating an account (business
          name, contact details) and information about how you use the platform, in order to
          operate your storefront and admin dashboard.
        </p>
        <p>
          We do not sell your data. Information you collect from your own customers through your
          storefront belongs to you and is used only to fulfill and manage their orders.
        </p>
        <p>
          Questions about this policy can be sent to
          {" "}
          <a href="mailto:hello@storepulse.com">hello@storepulse.com</a>.
        </p>
      </div>
    </main>
  );
}
