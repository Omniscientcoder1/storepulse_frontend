import { Card, CardContent } from "@storepulse/ui/components/card";

export default function CustomersLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
      <div className="h-9 w-full max-w-sm animate-pulse rounded-md bg-muted" />
      <Card>
        <CardContent>
          <div className="h-64 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
