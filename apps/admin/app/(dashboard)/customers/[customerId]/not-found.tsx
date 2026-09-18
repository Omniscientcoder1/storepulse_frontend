import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";

export default function CustomerNotFound() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Customer not found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This customer doesn&apos;t exist, or belongs to a different account.
        </p>
        <Link href="/customers" className="mt-4 inline-block text-sm underline">
          Back to customers
        </Link>
      </CardContent>
    </Card>
  );
}
