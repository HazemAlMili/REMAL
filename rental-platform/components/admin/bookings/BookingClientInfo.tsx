import { useClientDetail } from "@/lib/hooks/useClients";
import { User, Phone, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

interface BookingClientInfoProps {
  clientId: string;
}

export function BookingClientInfo({ clientId }: BookingClientInfoProps) {
  const { data: client, isLoading, isError } = useClientDetail(clientId);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-neutral-700">Client Info</h3>

      {!clientId ? (
        <p className="text-sm text-neutral-400">No client linked</p>
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">Client info unavailable</p>
      ) : client ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-neutral-400" />
            <Link
              href={ROUTES.admin.clients?.detail ? ROUTES.admin.clients.detail(client.id) : "#"}
              className="font-medium text-blue-600 hover:underline"
            >
              {client.name}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Phone className="h-4 w-4 text-neutral-400" />
            <a href={`tel:${client.phone}`} className="hover:underline">
              {client.phone}
            </a>
          </div>
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Mail className="h-4 w-4 text-neutral-400" />
              <a href={`mailto:${client.email}`} className="hover:underline">
                {client.email}
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
