import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CrmLeadFilters,
  PaginatedLeads,
  CrmLeadDetailsResponse,
  CreateCrmLeadRequest,
  UpdateCrmLeadRequest,
  UpdateCrmLeadStatusRequest,
  ConvertLeadToBookingRequest,
  CrmNoteResponse,
  AddLeadNoteRequest,
  UpdateCrmNoteRequest,
  CrmAssignmentResponse,
  AssignLeadRequest,
} from "@/lib/types/crm.types";
import type { BookingDetailsResponse } from "@/lib/types/booking.types";

export const crmService = {
  // ── Leads ──
  getLeads: (filters?: CrmLeadFilters): Promise<PaginatedLeads> =>
    api.get(endpoints.crmLeads.list, { params: filters }),

  getLeadById: (id: string): Promise<CrmLeadDetailsResponse> =>
    api.get(endpoints.crmLeads.byId(id)),

  createLead: (data: CreateCrmLeadRequest): Promise<CrmLeadDetailsResponse> =>
    api.post(endpoints.crmLeads.create, data),

  updateLead: (
    id: string,
    data: UpdateCrmLeadRequest
  ): Promise<CrmLeadDetailsResponse> =>
    api.put(endpoints.crmLeads.update(id), data),

  updateLeadStatus: (
    id: string,
    data: UpdateCrmLeadStatusRequest
  ): Promise<CrmLeadDetailsResponse> =>
    api.patch(endpoints.crmLeads.status(id), data),

  convertToBooking: (
    id: string,
    data: ConvertLeadToBookingRequest
  ): Promise<BookingDetailsResponse> =>
    api.post(endpoints.crmLeads.convertToBooking(id), data),

  // ── Notes ──
  getLeadNotes: (leadId: string): Promise<CrmNoteResponse[]> =>
    api.get(endpoints.crmNotes.leadNotesList(leadId)),

  addLeadNote: (
    leadId: string,
    data: AddLeadNoteRequest
  ): Promise<CrmNoteResponse> =>
    api.post(endpoints.crmNotes.leadNotesCreate(leadId), data),

  updateNote: (
    noteId: string,
    data: UpdateCrmNoteRequest
  ): Promise<CrmNoteResponse> =>
    api.put(endpoints.crmNotes.update(noteId), data),

  deleteNote: (noteId: string): Promise<void> =>
    api.delete(endpoints.crmNotes.delete(noteId)),

  // ── Assignment ──
  getLeadAssignment: (leadId: string): Promise<CrmAssignmentResponse> =>
    api.get(endpoints.crmAssignments.leadGet(leadId)),

  assignLead: (
    leadId: string,
    data: AssignLeadRequest
  ): Promise<CrmAssignmentResponse> =>
    api.post(endpoints.crmAssignments.leadSet(leadId), data),

  unassignLead: (leadId: string): Promise<void> =>
    api.delete(endpoints.crmAssignments.leadDelete(leadId)),
};
