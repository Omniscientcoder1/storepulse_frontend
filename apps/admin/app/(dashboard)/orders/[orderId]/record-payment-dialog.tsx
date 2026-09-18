"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import type { ManualPaymentProvider } from "@storepulse/api-client";
import { Button } from "@storepulse/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@storepulse/ui/components/dialog";
import { Input } from "@storepulse/ui/components/input";

const PROVIDERS: { value: ManualPaymentProvider; label: string }[] = [
  { value: "cod", label: "Cash on delivery" },
  { value: "bkash", label: "bKash (offline)" },
  { value: "bank", label: "Bank transfer" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  provider: z.enum(["cod", "bkash", "bank", "other"]),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 100 or 100.00"),
  reference: z.string().max(255).optional(),
  status: z.enum(["pending", "success"]),
});

export function RecordPaymentDialog({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<ManualPaymentProvider>("cod");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse({
      provider,
      amount,
      reference: reference || undefined,
      status: paid ? "success" : "pending",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, ...parsed.data }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        setError(body?.detail ?? "Could not record the payment");
        return;
      }
      setOpen(false);
      setAmount("");
      setReference("");
      setPaid(false);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Log a COD, offline bKash, or bank-transfer payment for this order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="provider" className="text-sm font-medium">
              Method
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as ManualPaymentProvider)}
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reference" className="text-sm font-medium">
              Reference <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="reference"
              placeholder="Transaction ID, note, etc."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="size-4"
            />
            Money already collected
          </label>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Recording…" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
