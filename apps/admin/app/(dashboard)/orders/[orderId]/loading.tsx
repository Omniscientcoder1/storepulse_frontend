import { Card, CardContent } from "@storepulse/ui/components/card";

export default function OrderDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="h-48 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="h-48 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
