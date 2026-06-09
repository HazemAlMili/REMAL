import { AdminUsersSection } from "@/components/admin/settings/AdminUsersSection";
import { NotificationPreferencesSection } from "@/components/admin/settings/NotificationPreferencesSection";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
          Admin settings
        </h1>
        <p className="text-sm text-neutral-500">
          Manage admin users, role access, active status, and your notification
          preferences.
        </p>
      </div>

      <div className="space-y-8 border-t border-neutral-200 pt-6">
        <AdminUsersSection />

        <div className="border-t border-neutral-200 pt-8">
          <NotificationPreferencesSection />
        </div>
      </div>
    </div>
  );
}
