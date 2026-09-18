import Link from "next/link";
import { redirect } from "next/navigation";

import { ApiError, type CustomerRead } from "@storepulse/api-client";
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

import { SearchBox } from "./search-box";

export const metadata = {
  title: "Customers — StorePulse Admin",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery ?? "";

  const token = await getSessionToken();
  if (!token) redirect("/login");

  let customers: CustomerRead[] = [];
  try {
    const page = await apiClientFor(token).customers.list({ q: query || undefined, limit: 100 });
    customers = page.items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Customers</h1>

      <SearchBox initialQuery={query} />

      <Card>
        <CardContent>
          {customers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? `No customers match "${query}".` : "No customers yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`} className="hover:underline">
                        {customer.name ?? "(no name)"}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address ?? "—"}</TableCell>
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
