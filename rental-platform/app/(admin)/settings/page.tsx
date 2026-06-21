import { AdminUsersSection } from "@/components/admin/settings/AdminUsersSection";
import { NotificationPreferencesSection } from "@/components/admin/settings/NotificationPreferencesSection";
import { RoleAccessSection } from "@/components/admin/settings/rbac/RoleAccessSection";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Admin settings
        </h1>
        <p className="text-sm text-neutral-500">
          Manage who runs Kaza Booking: operator accounts, role access, and how you
          hear about activity.
        </p>
      </div>

      <div className="space-y-8 border-t border-neutral-200 pt-6">
        <RoleAccessSection />

        <div className="border-t border-neutral-200 pt-8">
        <AdminUsersSection />
        </div>

        <div className="border-t border-neutral-200 pt-8">
          <NotificationPreferencesSection />
        </div>
      </div>
    </div>
  );
}
