"use client";

import { RouteError } from "../route-error";

export default function SettingsError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} title="Couldn't load settings" />;
}
