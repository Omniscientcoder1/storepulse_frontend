"use client";

import { RouteError } from "../route-error";

/** Route-segment error boundary — catches a non-401 failure loading the dashboard summary (backend down, network error). */
export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} title="Couldn't load the dashboard" />;
}
