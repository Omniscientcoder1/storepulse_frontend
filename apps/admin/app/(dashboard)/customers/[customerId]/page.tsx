import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApiError } from "@storepulse/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";
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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const token = await getSessionToken();
  if (!token) redirect("/login");

  let customer;
  try {
    customer = await apiClientFor(token).customers.get(customerId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/customers" className="text-sm text-muted-foreground hover:underline">
          ← Customers
        </Link>
        <h1 className="text-2xl font-semibold">{customer.name ?? "(no name)"}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Phone" value={customer.phone} />
            <Row label="WhatsApp" value={customer.whatsapp_id ?? "—"} />
            <Row label="Address" value={customer.address ?? "—"} />
            <Row label="Customer since" value={new Date(customer.created_at).toLocaleDateString()} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order history</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
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
                  {customer.orders.map((order) => (
                    <TableRow key={order.id}>
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
                      <TableCell className="text-right">{formatMoney(order.total_price)}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
