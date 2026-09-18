import { Card, CardContent } from "@storepulse/ui/components/card";

export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
      <Card>
        <CardContent>
          <div className="h-64 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
