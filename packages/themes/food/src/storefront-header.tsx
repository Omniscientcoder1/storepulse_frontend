import type { TenantStorefrontInfo } from "@storepulse/api-client";

/**
 * Food's header reads like the top of a restaurant menu card: a generously
 * rounded (but not full-pill) logo tile and a warm dashed rule underneath,
 * instead of Electronics' plain hairline, Fashion's borderless editorial
 * header, Beauty's rounded-full avatar, or Home & Kitchen's sharp-cornered
 * bordered one.
 */
export function StorefrontHeader({ info }: { info: TenantStorefrontInfo }) {
  return (
    <header className="flex flex-col gap-4 border-b-2 border-dashed border-[#e8dcc8] px-6 py-6 md:px-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {info.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- tenant-supplied logo URL, no fixed image domain to configure.
            <img src={info.logo_url} alt="" className="size-11 rounded-2xl object-cover shadow-sm" />
          ) : (
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm"
              style={{ background: "var(--storefront-primary)" }}
            >
              {info.business_name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="font-display text-xl font-bold tracking-tight">
            {info.business_name}
          </span>
        </div>
        <span className="hidden rounded-full bg-[#fff1e0] px-3 py-1 text-xs font-semibold text-[#9a5b1f] sm:inline">
          Cash on delivery available
        </span>
      </div>
    </header>
  );
}
