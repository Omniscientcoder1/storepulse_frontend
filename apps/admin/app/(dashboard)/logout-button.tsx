"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@storepulse/ui/components/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}
