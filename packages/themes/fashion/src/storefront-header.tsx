import type { TenantStorefrontInfo } from "@storepulse/api-client";

export function StorefrontHeader({ info }: { info: TenantStorefrontInfo }) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-6 md:px-10">
      <div className="flex items-center gap-3">
        {info.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- tenant-supplied logo URL, no fixed image domain to configure.
          <img src={info.logo_url} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full text-sm font-semibold tracking-wide text-white"
            style={{ background: "var(--storefront-primary)" }}
          >
            {info.business_name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="font-display text-lg font-medium tracking-wide uppercase">
          {info.business_name}
        </span>
      </div>
      <span className="hidden text-xs tracking-widest text-black/50 uppercase sm:inline">
        Cash on delivery available
      </span>
    </header>
  );
}
