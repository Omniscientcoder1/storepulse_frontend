"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// If the access token has this little time left (or less) when a dashboard
// page mounts, refresh it proactively (BE-36) rather than waiting for it to
// actually expire and dropping a request to 401 mid-navigation.
const REFRESH_THRESHOLD_SECONDS = 5 * 60;

/**
 * Mounted once per dashboard layout render. Renders nothing — its only job
 * is to call `/api/auth/refresh` when the access token (whose remaining
 * lifetime the server computed and passed down as a prop) is close to
 * expiring, then refresh the router so the next render picks up new session
 * state. This only fires on navigation; a long-idle tab that never
 * navigates won't trigger it (documented, accepted gap — see BE-36).
 */
export function SessionRefresher({
  expiresInSeconds,
}: {
  expiresInSeconds: number | null;
}) {
  const router = useRouter();

  useEffect(() => {
    if (expiresInSeconds === null || expiresInSeconds > REFRESH_THRESHOLD_SECONDS) {
      return;
    }

    let cancelled = false;
    void fetch("/api/auth/refresh", { method: "POST" }).then((response) => {
      if (!cancelled && response.ok) {
        router.refresh();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [expiresInSeconds, router]);

  return null;
}
