"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientDetailHeader } from "@/components/admin/clients/ClientDetailHeader";
import { ClientBookingHistory } from "@/components/admin/clients/ClientBookingHistory";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { clientsService } from "@/lib/api/services/clients.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { useRouter } from "next/navigation";

export default function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.clients.detail(params.id),
    queryFn: () => clientsService.getById(params.id),
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="p-6">
        <EmptyState
          title="Client not found"
          description="The client you're looking for doesn't exist or has been deleted."
        />
        <button
          onClick={() => router.push("/admin/clients")}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientDetailHeader client={client} />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Booking History</h2>
        <ClientBookingHistory clientId={client.id} />
      </div>
    </div>
  );
}
