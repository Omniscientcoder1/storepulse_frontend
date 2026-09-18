import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApiError } from "@storepulse/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";

import { apiClientFor } from "@/lib/api";
import { getSessionToken } from "@/lib/auth";

import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-button";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const token = await getSessionToken();
  if (!token) redirect("/login");

  let product;
  try {
    product = await apiClientFor(token).products.get(productId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/products" className="text-sm text-muted-foreground hover:underline">
            ← Products
          </Link>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
        </div>
        {product.is_active ? <DeleteProductButton productId={product.id} /> : null}
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Edit product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
