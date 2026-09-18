"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@storepulse/ui/components/input";

/**
 * Submits `?q=` as a real navigation (not client-side fetch) so the search
 * reuses the same server-rendered list page and stays a plain GET —
 * shareable/bookmarkable URL, no separate client-side data path to keep in
 * sync with the server component's.
 */
export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(params.size > 0 ? `/customers?${params}` : "/customers");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name or phone…"
      />
    </form>
  );
}
