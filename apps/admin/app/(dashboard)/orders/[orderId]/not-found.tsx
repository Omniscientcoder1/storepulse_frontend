import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";

export default function OrderNotFound() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Order not found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This order doesn&apos;t exist, or belongs to a different account.
        </p>
        <Link href="/orders" className="mt-4 inline-block text-sm underline">
          Back to orders
        </Link>
      </CardContent>
    </Card>
  );
}
