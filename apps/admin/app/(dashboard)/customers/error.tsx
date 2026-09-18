"use client";

import { RouteError } from "../route-error";

export default function CustomersError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} title="Couldn't load customers" />;
}
