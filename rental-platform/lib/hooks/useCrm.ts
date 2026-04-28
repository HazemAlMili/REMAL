import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { crmService } from "@/lib/api/services/crm.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { toastSuccess } from "@/lib/utils";
import { CRM_STATUS_LABELS } from "@/lib/constants/booking-statuses";
import type {
  CrmLeadStatus,
  CrmLeadListItemResponse,
  CreateCrmLeadRequest,
  ConvertLeadToBookingRequest,
  UpdateCrmLeadStatusRequest,
  AddLeadNoteRequest,
  UpdateCrmNoteRequest,
  AssignLeadRequest,
} from "@/lib/types/crm.types";

export function useLeadsPipeline() {
  const query = useQuery({
    queryKey: queryKeys.crm.leads(),
    queryFn: () => crmService.getLeads({ pageSize: 200 }), // fetch all for pipeline view
    staleTime: 1000 * 60 * 1, // 1 minute — pipeline needs to be relatively fresh
    refetchOnWindowFocus: true, // sales switches between windows
  });

  const groupedLeads = useMemo(() => {
    const all = query.data?.items ?? [];
    return all.reduce(
      (acc, lead) => {
        const status = lead.leadStatus;
        if (!acc[status]) acc[status] = [];
        acc[status].push(lead);
        return acc;
      },
      {} as Record<CrmLeadStatus, CrmLeadListItemResponse[]>
    );
  }, [query.data]);

  return {
    groupedLeads,
    totalCount: query.data?.pagination.totalCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// Stubs - implementations will be added per ticket
export const useGetLeads = () => {};

export function useLeadDetail(leadId: string) {
  return useQuery({
    queryKey: queryKeys.crm.leadDetail(leadId),
    queryFn: () => crmService.getLeadById(leadId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCrmLeadRequest) => crmService.createLead(data),
    onSuccess: () => {
      toastSuccess("Lead created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.leads() });
    },
  });
}
export const useUpdateLead = () => {};

export function useUpdateLeadStatus(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCrmLeadStatusRequest) =>
      crmService.updateLeadStatus(leadId, data),
    onSuccess: (updatedLead) => {
      toastSuccess(
        `Lead moved to ${CRM_STATUS_LABELS[updatedLead.leadStatus]}`
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadDetail(leadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.leads() });
    },
  });
}

export function useConvertToBooking(leadId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data: ConvertLeadToBookingRequest) =>
      crmService.convertToBooking(leadId, data),
    onSuccess: (booking) => {
      toastSuccess("Lead successfully converted to booking");
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadDetail(leadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.leads() });
      router.push(ROUTES.admin.bookings.detail(booking.id));
    },
  });
}

export function useLeadNotes(leadId: string) {
  return useQuery({
    queryKey: queryKeys.crm.leadNotes(leadId),
    queryFn: () => crmService.getLeadNotes(leadId),
  });
}

export function useAddLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddLeadNoteRequest) =>
      crmService.addLeadNote(leadId, data),
    onSuccess: () => {
      toastSuccess("Note added");
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadNotes(leadId),
      });
    },
  });
}

export function useUpdateCrmNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteId,
      data,
    }: {
      noteId: string;
      data: UpdateCrmNoteRequest;
    }) => crmService.updateNote(noteId, data),
    onSuccess: () => {
      toastSuccess("Note updated");
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadNotes(leadId),
      });
    },
  });
}

export function useDeleteCrmNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => crmService.deleteNote(noteId),
    onSuccess: () => {
      toastSuccess("Note deleted");
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadNotes(leadId),
      });
    },
  });
}

export function useLeadAssignment(leadId: string) {
  return useQuery({
    queryKey: queryKeys.crm.leadAssignment(leadId),
    queryFn: async () => {
      try {
        return await crmService.getLeadAssignment(leadId);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) return null; // No assignment yet — treat as Unassigned
        throw err;
      }
    },
    retry: false,
  });
}

export function useAssignLead(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignLeadRequest) =>
      crmService.assignLead(leadId, data),
    onSuccess: () => {
      toastSuccess("Lead assigned");
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadAssignment(leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadDetail(leadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.leads() });
    },
  });
}

export function useUnassignLead(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => crmService.unassignLead(leadId),
    onSuccess: () => {
      toastSuccess("Lead unassigned");
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadAssignment(leadId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.crm.leadDetail(leadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.leads() });
    },
  });
}
