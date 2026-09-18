import Link from "next/link";
import { redirect } from "next/navigation";

import { ApiError, type OrderRead, type OrderStatus } from "@storepulse/api-client";
import { cn } from "@storepulse/ui/lib/utils";
import { Card, CardContent } from "@storepulse/ui/components/card";
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
  title: "Orders — StorePulse Admin",
};

const STATUS_FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Pending payment", value: "pending_payment" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

function formatMoney(amount: string): string {
  const value = Number(amount);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    : amount;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    case "cancelled":
      return "bg-destructive/10 text-destructive";
    case "confirmed":
    case "shipped":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return STATUS_FILTERS.some((f) => f.value === value);
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = isOrderStatus(rawStatus) ? rawStatus : undefined;

  const token = await getSessionToken();
  if (!token) redirect("/login");

  let orders: OrderRead[] = [];
  try {
    const page = await apiClientFor(token).orders.list({ status, limit: 100 });
    orders = page.items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="flex flex-wrap gap-1">
        {STATUS_FILTERS.map((filter) => {
          const href = filter.value ? `/orders?status=${filter.value}` : "/orders";
          const active = status === filter.value;
          return (
            <Link
              key={filter.label}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders {status ? `with status "${status}"` : ""} yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          statusBadgeClass(order.status),
                        )}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(order.total_price)}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
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
