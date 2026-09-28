"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import type { PlanTier, SubdomainCheckResponse, TenantCategory } from "@storepulse/api-client";
import { Button } from "@storepulse/ui/components/button";
import { Input } from "@storepulse/ui/components/input";

import { PRICING_TIERS } from "@/lib/pricing";

// Same value/label pairs as apps/admin's settings-form.tsx — the category
// selector everywhere in the app reads from the same TenantCategory enum.
const CATEGORIES: { value: TenantCategory; label: string }[] = [
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "electronics", label: "Electronics" },
  { value: "home_kitchen", label: "Home & Kitchen" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
];

// Mirrors the backend's SubscribeRequest constraints (storepulse_backend/app/schemas/subscription.py).
const businessNameSchema = z.string().min(1, "Business name is required").max(255);
const subdomainSchema = z
  .string()
  .min(1, "Subdomain is required")
  .max(63, "Subdomain must be 63 characters or fewer")
  .regex(
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    "Use lower-case letters, numbers, and hyphens only — no leading or trailing hyphen",
  );

type Step = "business" | "category" | "subdomain" | "plan" | "review" | "success";

const STEP_ORDER: Step[] = ["business", "category", "subdomain", "plan", "review"];
const STEP_LABEL: Record<Step, string> = {
  business: "Business name",
  category: "Category",
  subdomain: "Subdomain",
  plan: "Plan",
  review: "Review",
  success: "Done",
};

type SubdomainCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "checked"; result: SubdomainCheckResponse }
  | { status: "error"; message: string };

const REASON_MESSAGE: Record<NonNullable<SubdomainCheckResponse["reason"]>, string> = {
  taken: "That subdomain is already taken.",
  reserved: "That subdomain is reserved for platform use.",
  invalid: "Use lower-case letters, numbers, and hyphens only — no leading or trailing hyphen.",
};

export function SignupWizard({ initialPlan }: { initialPlan?: PlanTier }) {
  const [step, setStep] = useState<Step>("business");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<TenantCategory>("other");
  const [subdomain, setSubdomain] = useState("");
  const [planTier, setPlanTier] = useState<PlanTier>(initialPlan ?? "starter");
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdSubdomain, setCreatedSubdomain] = useState<string | null>(null);

  const [checkState, setCheckState] = useState<SubdomainCheckState>({ status: "idle" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);
  const subdomainFormatIsValid = useMemo(
    () => subdomainSchema.safeParse(subdomain).success,
    [subdomain],
  );

  // Debounced live availability check as the user types the subdomain — this
  // is what lets a taken/reserved subdomain surface an error before
  // submission, per FE-15's definition of done. Only runs once the format is
  // already valid; an invalid format is rendered straight from
  // `subdomainFormatIsValid` (see SubdomainStatus below) rather than by
  // pushing an "idle" state from inside this effect.
  useEffect(() => {
    if (step !== "subdomain" || !subdomainFormatIsValid) return;

    const thisRequestId = ++requestIdRef.current;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // "checking" is set here, inside the timeout callback, rather than
      // synchronously in the effect body — react-hooks/set-state-in-effect
      // flags a direct setState call at the top of an effect (cascading
      // render risk); a callback fired later by a timer is exempt.
      setCheckState({ status: "checking" });
      try {
        const response = await fetch(
          `/api/signup/check-subdomain?value=${encodeURIComponent(subdomain)}`,
        );
        const body = (await response.json().catch(() => null)) as
          | SubdomainCheckResponse
          | { detail?: string }
          | null;
        if (requestIdRef.current !== thisRequestId) return; // stale response, a newer check superseded it

        if (!response.ok || !body || !("available" in body)) {
          const detail = body && "detail" in body ? body.detail : undefined;
          setCheckState({ status: "error", message: detail ?? "Could not check availability" });
          return;
        }
        setCheckState({ status: "checked", result: body });
      } catch {
        if (requestIdRef.current !== thisRequestId) return;
        setCheckState({ status: "error", message: "Could not reach the server" });
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [subdomain, step, subdomainFormatIsValid]);

  const subdomainIsAvailable = checkState.status === "checked" && checkState.result.available;

  function goToStep(next: Step) {
    setStepError(null);
    setStep(next);
  }

  function handleBusinessNext() {
    const parsed = businessNameSchema.safeParse(businessName);
    if (!parsed.success) {
      setStepError(parsed.error.issues[0]?.message ?? "Invalid business name");
      return;
    }
    goToStep("category");
  }

  function handleSubdomainNext() {
    const formatCheck = subdomainSchema.safeParse(subdomain);
    if (!formatCheck.success) {
      setStepError(formatCheck.error.issues[0]?.message ?? "Invalid subdomain");
      return;
    }
    if (!subdomainIsAvailable) {
      setStepError("Choose an available subdomain before continuing.");
      return;
    }
    goToStep("plan");
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          category,
          subdomain,
          plan_tier: planTier,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { subdomain?: string; detail?: string }
        | null;

      if (!response.ok) {
        setSubmitError(body?.detail ?? "Signup failed, please try again");
        // A 409/422 here means someone else claimed the subdomain in the gap
        // since the last live check — send the user back to fix it rather
        // than silently retrying.
        if (response.status === 409 || response.status === 422) {
          setCheckState({ status: "idle" });
          goToStep("subdomain");
        }
        return;
      }

      setCreatedSubdomain(body?.subdomain ?? subdomain);
      setStep("success");
    } catch {
      setSubmitError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "success") {
    return <SuccessPanel subdomain={createdSubdomain ?? subdomain} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <StepProgress current={step} />

      {step === "business" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="business_name" className="text-sm font-medium">
              Business name
            </label>
            <Input
              id="business_name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              aria-invalid={stepError ? true : undefined}
              autoFocus
              required
            />
          </div>
          <StepError message={stepError} />
          <Button onClick={handleBusinessNext}>Continue</Button>
        </div>
      ) : null}

      {step === "category" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium">
              What do you sell?
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TenantCategory)}
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs">
              This picks your storefront&rsquo;s starting theme — you can change it later.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goToStep("business")}>
              Back
            </Button>
            <Button onClick={() => goToStep("subdomain")} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === "subdomain" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="subdomain" className="text-sm font-medium">
              Choose your subdomain
            </label>
            <div className="flex items-center gap-1.5">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                aria-invalid={stepError ? true : undefined}
                autoFocus
                required
              />
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                .storepulse.com
              </span>
            </div>
            <SubdomainStatus
              subdomain={subdomain}
              formatIsValid={subdomainFormatIsValid}
              checkState={checkState}
            />
          </div>
          <StepError message={stepError} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goToStep("category")}>
              Back
            </Button>
            <Button
              onClick={handleSubdomainNext}
              disabled={!subdomainIsAvailable}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === "plan" ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">Choose a plan</p>
          <div className="flex flex-col gap-3">
            {PRICING_TIERS.map((tier) => (
              <button
                key={tier.slug}
                type="button"
                onClick={() => setPlanTier(tier.slug)}
                aria-pressed={planTier === tier.slug}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  planTier === tier.slug
                    ? "border-primary ring-primary/30 ring-2"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tier.name}</span>
                  <span className="text-sm">৳{tier.priceBdt.toLocaleString()}/mo</span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{tier.description}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goToStep("subdomain")}>
              Back
            </Button>
            <Button onClick={() => goToStep("review")} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-2 text-sm">
            <ReviewRow label="Business name" value={businessName} />
            <ReviewRow
              label="Category"
              value={CATEGORIES.find((c) => c.value === category)?.label ?? category}
            />
            <ReviewRow label="Subdomain" value={`${subdomain}.storepulse.com`} />
            <ReviewRow
              label="Plan"
              value={PRICING_TIERS.find((t) => t.slug === planTier)?.name ?? planTier}
            />
          </dl>
          {submitError ? (
            <p role="alert" className="text-destructive text-sm">
              {submitError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goToStep("plan")} disabled={submitting}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "Creating your store…" : "Create my store"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StepProgress({ current }: { current: Step }) {
  const index = STEP_ORDER.indexOf(current);
  return (
    <ol className="flex items-center gap-1.5" aria-label="Signup progress">
      {STEP_ORDER.map((s, i) => (
        <li
          key={s}
          aria-current={s === current ? "step" : undefined}
          className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-muted"}`}
          title={STEP_LABEL[s]}
        />
      ))}
    </ol>
  );
}

function StepError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-destructive text-sm">
      {message}
    </p>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function SubdomainStatus({
  subdomain,
  formatIsValid,
  checkState,
}: {
  subdomain: string;
  formatIsValid: boolean;
  checkState: SubdomainCheckState;
}) {
  if (!subdomain) return null;
  if (!formatIsValid) {
    return (
      <p role="alert" aria-live="polite" className="text-destructive text-xs">
        Use lower-case letters, numbers, and hyphens only — no leading or trailing hyphen.
      </p>
    );
  }
  if (checkState.status === "checking") {
    return (
      <p aria-live="polite" className="text-muted-foreground text-xs">
        Checking availability…
      </p>
    );
  }
  if (checkState.status === "error") {
    return (
      <p role="alert" aria-live="polite" className="text-destructive text-xs">
        {checkState.message}
      </p>
    );
  }
  if (checkState.status === "checked") {
    if (checkState.result.available) {
      return (
        <p aria-live="polite" className="text-xs text-green-600 dark:text-green-400">
          {subdomain}.storepulse.com is available.
        </p>
      );
    }
    const reason = checkState.result.reason;
    return (
      <p role="alert" aria-live="polite" className="text-destructive text-xs">
        {reason ? REASON_MESSAGE[reason] : "That subdomain isn't available."}
      </p>
    );
  }
  return null;
}

function SuccessPanel({ subdomain }: { subdomain: string }) {
  const storefrontUrl = `https://${subdomain}.storepulse.com`;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-lg font-semibold">Your store is live 🎉</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Your storefront is ready at{" "}
          <a href={storefrontUrl} className="text-primary underline underline-offset-4">
            {storefrontUrl}
          </a>
          .
        </p>
      </div>
      <p className="text-muted-foreground text-sm">
        Admin dashboard access (to manage orders and products) is set up separately — we&rsquo;ll
        be in touch with next steps to get you logged in.
      </p>
      <Button asChild>
        <a href={storefrontUrl}>View your storefront</a>
      </Button>
    </div>
  );
}
