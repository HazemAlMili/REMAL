"use client";

import { FileQuestion, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLeadDetail } from "@/lib/hooks/useCrm";
import { LeadDetailHeader } from "@/components/admin/crm/LeadDetailHeader";
import { LeadUnitInfo } from "@/components/admin/crm/LeadUnitInfo";
import { LeadStatusTransition } from "@/components/admin/crm/LeadStatusTransition";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/routes";

import { LeadNotes } from "@/components/admin/crm/LeadNotes";
import { LeadAssignment } from "@/components/admin/crm/LeadAssignment";
import { ConvertToBookingPanel } from "@/components/admin/crm/ConvertToBookingPanel";

export default function LeadDetailPage() {
  const { leadId } = useParams();
  const {
    data: lead,
    isLoading,
    isError,
    error,
  } = useLeadDetail(leadId as string);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" rounded="lg" />
        <Skeleton className="mt-4 h-48 w-full" rounded="lg" />
        <Skeleton className="h-32 w-full" rounded="lg" />
      </div>
    );
  }

  if (isError) {
    const err = error as { response?: { status?: number } };
    const isNotFound = err?.response?.status === 404;
    if (isNotFound) {
      return (
        <EmptyState
          icon={<FileQuestion className="h-8 w-8" />}
          title="Lead not found"
          description="This lead may have been removed or the ID is incorrect"
          action={
            <Link href={ROUTES.admin.crm.index}>
              <Button variant="outline">Back to Pipeline</Button>
            </Link>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={<AlertCircle className="h-8 w-8" />}
        title="Could not load lead"
        description="An error occurred while fetching lead details"
      />
    );
  }

  if (!lead) return null;

  return (
    <div className="space-y-6">
      <LeadDetailHeader lead={lead} />

      <LeadUnitInfo lead={lead} />

      {/* Status & Actions - FE-3-CRM-05 */}
      <LeadStatusTransition leadId={lead.id} currentStatus={lead.leadStatus} />

      {/* Notes - FE-3-CRM-06 */}
      <LeadNotes leadId={lead.id} />

      {/* Assignment - FE-3-CRM-07 */}
      <LeadAssignment leadId={lead.id} />

      {/* Convert to Booking - FE-3-CRM-09 */}
      <ConvertToBookingPanel leadId={lead.id} lead={lead} />
    </div>
  );
}
