import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";

import { ProductForm } from "../product-form";

export const metadata = {
  title: "Add product — StorePulse Admin",
};

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/products" className="text-sm text-muted-foreground hover:underline">
          ← Products
        </Link>
        <h1 className="text-2xl font-semibold">Add product</h1>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
