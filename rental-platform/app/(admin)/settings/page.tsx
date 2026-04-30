import { AdminUsersSection } from "@/components/admin/settings/AdminUsersSection";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
          Settings
        </h1>
        <p className="text-sm text-neutral-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <AdminUsersSection />
      </div>
    </div>
  );
}
