export const metadata = {
  title: "Store unavailable",
};

/**
 * Rendered by `middleware.ts`'s rewrite when the requested `Host` doesn't
 * resolve to any tenant (unknown subdomain/custom domain) or the tenant
 * lookup itself failed. Deliberately generic — this must not distinguish
 * "no such store" from a backend outage to a visitor, and must never fall
 * through to rendering someone else's data.
 */
export default function StoreUnavailablePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <h1 className="font-display text-2xl font-semibold">This store isn&apos;t available</h1>
      <p className="text-white/60">
        The link you followed doesn&apos;t match a StorePulse store. Double-check the
        address, or come back later.
      </p>
    </div>
  );
}
