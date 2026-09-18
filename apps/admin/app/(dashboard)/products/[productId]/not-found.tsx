import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";

export default function ProductNotFound() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Product not found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This product doesn&apos;t exist, or belongs to a different account.
        </p>
        <Link href="/products" className="mt-4 inline-block text-sm underline">
          Back to products
        </Link>
      </CardContent>
    </Card>
  );
}
