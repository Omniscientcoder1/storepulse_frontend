import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApiError, type OrderStatus, type PaymentRead } from "@storepulse/api-client";
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

import { RecordPaymentDialog } from "./record-payment-dialog";
import { StatusControl } from "./status-control";

function formatMoney(amount: string): string {
  const value = Number(amount);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    : amount;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const client = apiClientFor(token);

  let order;
  try {
    order = await client.orders.get(orderId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Neither field is denormalized onto OrderRead, so they're resolved with
  // one extra call each rather than left as bare UUIDs in the UI.
  const [customer, product, payments] = await Promise.all([
    client.customers.get(order.customer_id).catch((error) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }),
    client.products.get(order.product_id).catch((error) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }),
    client.payments.listForOrder(orderId).catch((error): PaymentRead[] => {
      if (error instanceof ApiError) return [];
      throw error;
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/orders" className="text-sm text-muted-foreground hover:underline">
            ← Orders
          </Link>
          <h1 className="text-2xl font-semibold">Order {order.id.slice(0, 8)}</h1>
        </div>
        <RecordPaymentDialog orderId={order.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Status" value={order.status} />
            <Row label="Product" value={product?.name ?? order.product_id} />
            <Row label="Quantity" value={String(order.quantity)} />
            <Row label="Total price" value={formatMoney(order.total_price)} />
            <Row label="Deposit" value={formatMoney(order.deposit_amount)} />
            <Row label="Delivery method" value={order.delivery_method} />
            <Row label="Delivery address" value={order.delivery_address ?? "—"} />
            <Row label="Special instructions" value={order.special_instructions ?? "—"} />
            <Row label="Placed" value={new Date(order.created_at).toLocaleString()} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {customer ? (
                <>
                  <Row label="Name" value={customer.name ?? "—"} />
                  <Row label="Phone" value={customer.phone} />
                  <Row label="Address" value={customer.address ?? "—"} />
                </>
              ) : (
                <p className="text-muted-foreground">Customer record not found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusControl orderId={order.id} currentStatus={order.status as OrderStatus} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.provider}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell className="text-right">{formatMoney(payment.amount)}</TableCell>
                    <TableCell>{payment.provider_payment_ref ?? "—"}</TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
