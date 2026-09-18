import { redirect } from "next/navigation";

import { ApiError, type DashboardSummary } from "@storepulse/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@storepulse/ui/components/table";

import { apiClientFor } from "@/lib/api";
import { getSessionToken } from "@/lib/auth";

export const metadata = {
  title: "Dashboard — StorePulse Admin",
};

function formatCurrency(amount: string): string {
  const value = Number(amount);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    : amount;
}

async function loadSummary(): Promise<DashboardSummary | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    return await apiClientFor(token).dashboard.summary();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export default async function DashboardPage() {
  const summary = await loadSummary();
  if (!summary) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.orders_today}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatCurrency(summary.revenue_this_month)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low-stock products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.low_stock_products.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low-stock alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.low_stock_products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing is low on stock right now.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Stock remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.low_stock_products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">{product.stock_quantity}</TableCell>
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
