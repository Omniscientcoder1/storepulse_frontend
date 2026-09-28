import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@storepulse/ui/components/card";
import type { PlanTier } from "@storepulse/api-client";

import { SignupWizard } from "./signup-wizard";

export const metadata: Metadata = {
  title: "Create your store",
  description: "Set up your StorePulse storefront in a few steps — no credit card required to start.",
};

const VALID_PLANS: readonly PlanTier[] = ["starter", "growth", "pro"];

function parsePlan(value: string | undefined): PlanTier | undefined {
  return VALID_PLANS.includes(value as PlanTier) ? (value as PlanTier) : undefined;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Create your store</CardTitle>
          <CardDescription>
            Business name, category, subdomain, and a plan — that&rsquo;s all it takes to go live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupWizard initialPlan={parsePlan(plan)} />
        </CardContent>
      </Card>
    </main>
  );
}
