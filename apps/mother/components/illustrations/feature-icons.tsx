/**
 * Bespoke accent glyphs for the feature showcase — hand-drawn shapes in the
 * brand/accent palette rather than a generic icon-pack lookup, so the
 * feature grid doesn't read as "another lucide-react list."
 */

function IconShell({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function StorefrontIcon() {
  return (
    <IconShell>
      <rect x="6" y="14" width="36" height="28" rx="6" fill="var(--color-brand-600)" fillOpacity="0.15" />
      <path d="M6 20 L10 8 H38 L42 20" stroke="var(--color-brand-600)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 42 V30 a6 6 0 0 1 12 0 V42" stroke="var(--color-accent-500)" strokeWidth="2.5" />
    </IconShell>
  );
}

export function InboxIcon() {
  return (
    <IconShell>
      <rect x="6" y="10" width="36" height="28" rx="8" fill="var(--color-brand-600)" fillOpacity="0.15" />
      <path
        d="M10 16 L24 27 L38 16"
        stroke="var(--color-brand-600)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="12" r="6" fill="var(--color-accent-500)" />
    </IconShell>
  );
}

export function PaymentIcon() {
  return (
    <IconShell>
      <rect x="5" y="12" width="38" height="24" rx="5" fill="var(--color-brand-600)" fillOpacity="0.15" />
      <rect x="5" y="18" width="38" height="5" fill="var(--color-brand-600)" />
      <rect x="11" y="28" width="12" height="4" rx="2" fill="var(--color-accent-500)" />
    </IconShell>
  );
}

export function AiSparkIcon() {
  return (
    <IconShell>
      <path
        d="M24 6 L27 20 L41 24 L27 28 L24 42 L21 28 L7 24 L21 20 Z"
        fill="var(--color-accent-500)"
        fillOpacity="0.85"
      />
      <circle cx="38" cy="10" r="3" fill="var(--color-brand-600)" />
    </IconShell>
  );
}
