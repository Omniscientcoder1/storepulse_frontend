import { redirect } from "next/navigation";

import { ApiError } from "@storepulse/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@storepulse/ui/components/card";

import { apiClientFor } from "@/lib/api";
import { getSessionToken } from "@/lib/auth";

import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Settings — StorePulse Admin",
};

export default async function SettingsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  let settings;
  try {
    settings = await apiClientFor(token).settings.get();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Storefront settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
