"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ALLOWED_ORDER_TRANSITIONS, type OrderStatus } from "@storepulse/api-client";
import { Button } from "@storepulse/ui/components/button";

/**
 * Only offers transitions `ALLOWED_ORDER_TRANSITIONS` (mirroring the
 * backend's `ALLOWED_TRANSITIONS` graph in `app/services/orders.py`) allows
 * from the order's current status — the backend remains the source of
 * truth and re-validates regardless, but the UI shouldn't dangle a button
 * for a transition it already knows will be rejected.
 */
export function StatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = ALLOWED_ORDER_TRANSITIONS[currentStatus] ?? [];

  async function transitionTo(status: OrderStatus) {
    setPending(status);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        // The backend's 409 detail ("Cannot transition order from X to Y") is
        // shown verbatim — this is the "reaches the backend anyway" case the
        // task calls out, so the rejection must be clear, not generic.
        setError(body?.detail ?? "Could not update the order status");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setPending(null);
    }
  }

  if (nextStatuses.length === 0) {
    return <p className="text-sm text-muted-foreground">No further status changes available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            variant={status === "cancelled" ? "destructive" : "default"}
            size="sm"
            disabled={pending !== null}
            onClick={() => transitionTo(status)}
          >
            {pending === status ? "Updating…" : `Mark as ${status.replace("_", " ")}`}
          </Button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
