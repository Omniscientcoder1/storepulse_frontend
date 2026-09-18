import Link from "next/link";
import { redirect } from "next/navigation";

import { ApiError, type ProductRead } from "@storepulse/api-client";
import { Button } from "@storepulse/ui/components/button";
import { Card, CardContent } from "@storepulse/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@storepulse/ui/components/table";
import { cn } from "@storepulse/ui/lib/utils";

import { apiClientFor } from "@/lib/api";
import { getSessionToken } from "@/lib/auth";

export const metadata = {
  title: "Products — StorePulse Admin",
};

function formatMoney(amount: string): string {
  const value = Number(amount);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    : amount;
}

export default async function ProductsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  let products: ProductRead[] = [];
  try {
    const page = await apiClientFor(token).products.list({ limit: 100 });
    products = page.items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild>
          <Link href="/products/new">Add product</Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          {products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products yet. Add your first one to start taking orders.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link href={`/products/${product.id}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(product.base_price)}</TableCell>
                    <TableCell className="text-right">
                      {product.stock_quantity ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          product.is_active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
