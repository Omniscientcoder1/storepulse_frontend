export const metadata = {
  title: "Store unavailable",
};

/**
 * Rendered by `middleware.ts`'s rewrite when the resolved tenant exists but
 * is suspended (`is_active = false`, backend 403). Separate from
 * `/store-unavailable` in code (so the two cases stay easy to tell apart
 * while debugging) but intentionally near-identical copy — a visitor
 * shouldn't be able to distinguish "suspended" from "never existed" either.
 */
export default function StoreSuspendedPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <h1 className="font-display text-2xl font-semibold">This store isn&apos;t available</h1>
      <p className="text-white/60">
        This store is temporarily unavailable. Please check back later.
      </p>
    </div>
  );
}
