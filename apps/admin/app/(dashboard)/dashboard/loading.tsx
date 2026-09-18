import { Card, CardContent, CardHeader } from "@storepulse/ui/components/card";

/**
 * Next.js route-segment loading UI — shown while `page.tsx`'s server-side
 * fetch (session token → `/admin/dashboard/summary`) is in flight, e.g. on a
 * slow connection or slow backend. Mirrors the loaded layout's shape so the
 * page doesn't visibly jump once data arrives.
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
