import Link from "next/link";

export const metadata = {
  title: "Order confirmed",
};

function formatPriceBdt(total: string): string {
  const value = Number(total);
  if (Number.isNaN(value)) return total;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const total = Array.isArray(params.total) ? params.total[0] : params.total;

  if (!orderId) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold">No order to show</h1>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to the storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
      <span
        aria-hidden
        className="flex size-14 items-center justify-center rounded-full text-2xl"
        style={{ background: "var(--storefront-primary)" }}
      >
        ✓
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Order placed!</h1>
        <p className="text-white/60">
          Thanks — we&apos;ve received your order and will confirm it by phone or WhatsApp shortly.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left text-sm">
        <div className="flex justify-between">
          <span className="text-white/50">Order ID</span>
          <span className="font-mono">{orderId.slice(0, 8)}</span>
        </div>
        {total ? (
          <div className="flex justify-between">
            <span className="text-white/50">Total (Cash on Delivery)</span>
            <span className="font-semibold tabular-nums">{formatPriceBdt(total)}</span>
          </div>
        ) : null}
      </div>

      <Link
        href="/"
        className="rounded-lg px-4 py-3 text-sm font-semibold text-white"
        style={{ background: "var(--storefront-primary)" }}
      >
        Continue shopping
      </Link>
    </div>
  );
}
