"use client";

import { Button } from "@storepulse/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";

/** Shared body for every `(dashboard)/**\/error.tsx` route-segment boundary — a non-401 fetch failure (backend down, network error). */
export function RouteError({ reset, title }: { reset: () => void; title: string }) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Something went wrong reaching the server. Please try again.
        </p>
        <Button onClick={reset} className="self-start">
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
