import type { TenantStorefrontInfo } from "@storepulse/api-client";

export function StorefrontHeader({ info }: { info: TenantStorefrontInfo }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">
      <div className="flex items-center gap-3">
        {info.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- tenant-supplied logo URL, no fixed image domain to configure.
          <img src={info.logo_url} alt="" className="size-8 rounded-md object-cover" />
        ) : (
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md text-sm font-semibold text-white"
            style={{ background: "var(--storefront-primary)" }}
          >
            {info.business_name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="font-display text-lg font-semibold">{info.business_name}</span>
      </div>
      <span className="hidden text-sm text-white/50 sm:inline">Cash on delivery available</span>
    </header>
  );
}
