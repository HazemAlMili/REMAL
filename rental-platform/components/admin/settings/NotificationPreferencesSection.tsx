"use client";

import { useMemo, useState } from "react";
import {
  useAdminNotificationPreferences,
  useUpdateAdminNotificationPreference,
} from "@/lib/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { NOTIFICATION_CHANNEL_LABELS } from "@/lib/constants/notification-channels";
import type { NotificationChannel } from "@/lib/types/notification.types";

const CHANNELS: NotificationChannel[] = ["Email", "SMS", "InApp"];

export function NotificationPreferencesSection() {
  const {
    data: preferences,
    isLoading,
    error,
  } = useAdminNotificationPreferences();
  const updateMutation = useUpdateAdminNotificationPreference();
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Transform flat preferences list into a matrix: { [preferenceKey]: { [channel]: isEnabled } }
  const matrix = useMemo(() => {
    if (!preferences) return {};
    const result: Record<string, Record<string, boolean>> = {};
    for (const pref of preferences) {
      if (!result[pref.preferenceKey]) {
        result[pref.preferenceKey] = {};
      }
      const prefRow = result[pref.preferenceKey];
      if (prefRow) {
        prefRow[pref.channel] = pref.isEnabled;
      }
    }
    return result;
  }, [preferences]);

  // Extract unique preference keys for rows (preserving API order)
  const preferenceKeys = useMemo(() => {
    if (!preferences) return [];
    const seen = new Set<string>();
    const keys: string[] = [];
    for (const pref of preferences) {
      if (!seen.has(pref.preferenceKey)) {
        seen.add(pref.preferenceKey);
        keys.push(pref.preferenceKey);
      }
    }
    return keys;
  }, [preferences]);

  // Format preference key for display (camelCase → words)
  const formatPreferenceKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const handleToggle = (
    preferenceKey: string,
    channel: NotificationChannel,
    currentValue: boolean
  ) => {
    const toggleId = `${preferenceKey}-${channel}`;
    setTogglingKey(toggleId);

    updateMutation.mutate(
      {
        channel,
        preferenceKey, // Per P26 — NOT "type"
        isEnabled: !currentValue,
      },
      {
        onSuccess: () => {
          setTogglingKey(null);
          toast.success("Preference updated");
        },
        onError: () => {
          setTogglingKey(null);
          toast.error("Could not update preference");
          // Query invalidation will refetch and revert the UI to the correct state
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Notification Preferences
        </h2>
        <Skeleton height={200} className="rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Notification Preferences
        </h2>
        <EmptyState
          title="Could not load notification preferences"
          description="There was a problem fetching your preferences."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // Empty state
  if (!preferences || preferences.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Notification Preferences
        </h2>
        <EmptyState
          title="No notification preferences available"
          description="Notification preferences will appear here when configured."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">
          Notification Preferences
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Control which notifications you receive and via which channel.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Notification Type
              </th>
              {CHANNELS.map((channel) => (
                <th
                  key={channel}
                  className="px-4 py-3 text-center text-sm font-medium text-neutral-600"
                >
                  {NOTIFICATION_CHANNEL_LABELS[channel]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preferenceKeys.map((key) => (
              <tr
                key={key}
                className="border-b border-neutral-100 hover:bg-neutral-50"
              >
                <td className="px-4 py-3 text-sm text-neutral-700">
                  {formatPreferenceKey(key)}
                </td>
                {CHANNELS.map((channel) => {
                  const isEnabled = matrix[key]?.[channel] ?? false;
                  const toggleId = `${key}-${channel}`;
                  const isToggling = togglingKey === toggleId;

                  return (
                    <td key={channel} className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(key, channel, isEnabled)}
                        disabled={isToggling}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${isEnabled ? "bg-primary-500" : "bg-neutral-300"}
                          ${isToggling ? "cursor-wait opacity-50" : "cursor-pointer"}
                        `}
                        aria-label={`${formatPreferenceKey(key)} via ${NOTIFICATION_CHANNEL_LABELS[channel]}: ${isEnabled ? "On" : "Off"}`}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${isEnabled ? "translate-x-6" : "translate-x-1"}
                          `}
                        />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
