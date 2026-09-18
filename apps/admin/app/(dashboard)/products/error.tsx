"use client";

import { RouteError } from "../route-error";

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} title="Couldn't load products" />;
}
