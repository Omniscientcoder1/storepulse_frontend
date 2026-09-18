"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@storepulse/ui/components/button";

/** Soft-deletes (deactivates) a product — mirrors the backend's DELETE, which never hard-deletes so order history stays intact. */
export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Deactivate this product? It will no longer be orderable on the storefront.")) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        setError(body?.detail ?? "Could not deactivate the product");
        return;
      }
      router.push("/products");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
        {pending ? "Deactivating…" : "Deactivate"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
