import Link from "next/link";
import { Ticket, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Settings",
  description: "Manage your JeffreysPrompts preferences.",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="border-b border-border/60 bg-white dark:bg-neutral-900">
        <div className="container-wide py-10">
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage your support tickets and account preferences.
          </p>
        </div>
      </div>

      <div className="container-wide py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/settings/tickets" className="group">
            <Card className="transition-colors group-hover:border-indigo-300 dark:group-hover:border-indigo-700">
              <CardContent className="p-6 space-y-3">
                <Ticket className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">My Tickets</h2>
                  <p className="text-sm text-muted-foreground">
                    View support requests submitted from this device.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-dashed border-border/60">
            <CardContent className="p-6 space-y-3">
              <User className="h-6 w-6 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Profile</h2>
                <p className="text-sm text-muted-foreground">
                  Profile settings are coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
