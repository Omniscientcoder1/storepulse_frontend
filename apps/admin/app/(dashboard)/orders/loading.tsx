import { Card, CardContent } from "@storepulse/ui/components/card";

export default function OrdersLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
      <Card>
        <CardContent>
          <div className="h-64 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
