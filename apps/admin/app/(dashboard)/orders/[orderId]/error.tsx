"use client";

import { RouteError } from "../../route-error";

export default function OrderDetailError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} title="Couldn't load this order" />;
}
