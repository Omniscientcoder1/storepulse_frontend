import { Card, CardContent } from "@storepulse/ui/components/card";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <div className="h-96 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
