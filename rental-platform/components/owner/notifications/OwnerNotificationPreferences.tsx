"use client";

import { useState } from "react";
import {
  useOwnerNotificationPreferences,
  useUpdateOwnerNotificationPreference,
} from "@/lib/hooks/useNotifications";
import { toast } from "react-hot-toast";
import type {
  NotificationPreferenceResponse,
  NotificationChannel,
} from "@/lib/types/notification.types";

const CHANNELS: NotificationChannel[] = ["Email", "SMS", "InApp"];

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  Email: "Email",
  SMS: "SMS",
  InApp: "In-app",
};

// Group preferences by preferenceKey for matrix display
function groupByPreferenceKey(preferences: NotificationPreferenceResponse[]) {
  const groups: Record<
    string,
    Partial<Record<NotificationChannel, NotificationPreferenceResponse>>
  > = {};

  for (const pref of preferences) {
    if (!groups[pref.preferenceKey]) {
      groups[pref.preferenceKey] = {};
    }
    const group = groups[pref.preferenceKey];
    if (group) {
      group[pref.channel] = pref;
    }
  }

  return groups;
}

// Format preferenceKey for display (BOOKING_CONFIRMED → Booking Confirmed)
function formatPreferenceKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function OwnerNotificationPreferences() {
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useOwnerNotificationPreferences();
  const upsertMutation = useUpdateOwnerNotificationPreference();

  // Track local toggle state for optimistic updates and error revert
  const [localToggles, setLocalToggles] = useState<Record<string, boolean>>({});

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-lg bg-neutral-200"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load preferences
          </h2>
          <p className="mt-1 text-sm text-red-600">
            We could not load your notification preferences.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!preferences || preferences.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-neutral-900">
            No notification preferences
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Notification preferences will appear here once they are configured.
          </p>
        </div>
      </div>
    );
  }

  const grouped = groupByPreferenceKey(preferences);
  const preferenceKeys = Object.keys(grouped).sort();

  const handleToggle = (
    preferenceKey: string,
    channel: NotificationChannel,
    currentEnabled: boolean
  ) => {
    const newEnabled = !currentEnabled;
    const toggleKey = `${preferenceKey}-${channel}`;

    // Optimistic local update
    setLocalToggles((prev) => ({ ...prev, [toggleKey]: newEnabled }));

    upsertMutation.mutate(
      {
        preferenceKey, // P26: preferenceKey, NOT type
        channel,
        isEnabled: newEnabled,
      },
      {
        onSuccess: () => {
          toast.success("Preference updated");
        },
        onError: () => {
          // Revert optimistic update
          setLocalToggles((prev) => {
            const next = { ...prev };
            delete next[toggleKey];
            return next;
          });
          toast.error("Could not update preference");
        },
      }
    );
  };

  const getEffectiveEnabled = (
    pref: NotificationPreferenceResponse
  ): boolean => {
    const toggleKey = `${pref.preferenceKey}-${pref.channel}`;
    return toggleKey in localToggles
      ? localToggles[toggleKey]!
      : pref.isEnabled;
  };

  return (
    <div className="overflow-x-auto p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">
              Notification Type
            </th>
            {CHANNELS.map((channel) => (
              <th
                key={channel}
                className="px-4 py-3 text-center text-sm font-medium text-neutral-500"
              >
                {CHANNEL_LABELS[channel]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preferenceKeys.map((preferenceKey) => (
            <tr key={preferenceKey} className="border-b border-neutral-100">
              <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                {formatPreferenceKey(preferenceKey)}
              </td>
              {CHANNELS.map((channel) => {
                const pref = grouped[preferenceKey]?.[channel];
                if (!pref) {
                  return (
                    <td key={channel} className="px-4 py-3 text-center">
                      <span className="text-xs text-neutral-300">—</span>
                    </td>
                  );
                }

                const isEnabled = getEffectiveEnabled(pref);
                const isToggling = upsertMutation.isPending;

                return (
                  <td key={channel} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      disabled={isToggling}
                      onClick={() =>
                        handleToggle(preferenceKey, channel, isEnabled)
                      }
                      className={[
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        isEnabled ? "bg-blue-600" : "bg-neutral-200",
                        isToggling
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          isEnabled ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
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
  );
}
