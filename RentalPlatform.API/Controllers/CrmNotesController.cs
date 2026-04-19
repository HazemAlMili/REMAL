using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.CrmNotes;
using RentalPlatform.API.DTOs.Responses.CrmNotes;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "SalesOrSuperAdmin")]
public class CrmNotesController : ControllerBase
{
    private readonly ICrmNoteService _crmNoteService;

    public CrmNotesController(ICrmNoteService crmNoteService)
    {
        _crmNoteService = crmNoteService;
    }

    // 1. GET /api/internal/bookings/{bookingId}/notes
    [HttpGet("api/internal/bookings/{bookingId}/notes")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CrmNoteResponse>>>> GetBookingNotes(Guid bookingId)
    {
        var notes = await _crmNoteService.GetByBookingIdAsync(bookingId);
        var response = notes.Select(MapToResponse).ToList();
        return Ok(ApiResponse<IReadOnlyList<CrmNoteResponse>>.CreateSuccess(response));
    }

    // 2. POST /api/internal/bookings/{bookingId}/notes
    [HttpPost("api/internal/bookings/{bookingId}/notes")]
    public async Task<ActionResult<ApiResponse<CrmNoteResponse>>> AddBookingNote(Guid bookingId, AddBookingNoteRequest request)
    {
        var adminId = GetCurrentAdminId();
        var note = await _crmNoteService.AddToBookingAsync(bookingId, adminId, request.NoteText);
        return Ok(ApiResponse<CrmNoteResponse>.CreateSuccess(MapToResponse(note), "Note added to booking successfully."));
    }

    // 3. GET /api/internal/crm/leads/{leadId}/notes
    [HttpGet("api/internal/crm/leads/{leadId}/notes")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CrmNoteResponse>>>> GetLeadNotes(Guid leadId)
    {
        var notes = await _crmNoteService.GetByLeadIdAsync(leadId);
        var response = notes.Select(MapToResponse).ToList();
        return Ok(ApiResponse<IReadOnlyList<CrmNoteResponse>>.CreateSuccess(response));
    }

    // 4. POST /api/internal/crm/leads/{leadId}/notes
    [HttpPost("api/internal/crm/leads/{leadId}/notes")]
    public async Task<ActionResult<ApiResponse<CrmNoteResponse>>> AddLeadNote(Guid leadId, AddLeadNoteRequest request)
    {
        var adminId = GetCurrentAdminId();
        var note = await _crmNoteService.AddToLeadAsync(leadId, adminId, request.NoteText);
        return Ok(ApiResponse<CrmNoteResponse>.CreateSuccess(MapToResponse(note), "Note added to lead successfully."));
    }

    // 5. PUT /api/internal/crm/notes/{id}
    [HttpPut("api/internal/crm/notes/{id}")]
    public async Task<ActionResult<ApiResponse<CrmNoteResponse>>> UpdateCrmNote(Guid id, UpdateCrmNoteRequest request)
    {
        var note = await _crmNoteService.UpdateAsync(id, request.NoteText);
        return Ok(ApiResponse<CrmNoteResponse>.CreateSuccess(MapToResponse(note), "Note updated successfully."));
    }

    // 6. DELETE /api/internal/crm/notes/{id}
    [HttpDelete("api/internal/crm/notes/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteCrmNote(Guid id)
    {
        await _crmNoteService.DeleteAsync(id);
        return Ok(ApiResponse.CreateSuccess(null, "Note deleted successfully."));
    }

    private Guid GetCurrentAdminId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim) || !Guid.TryParse(subClaim, out var adminId))
        {
            throw new UnauthorizedAccessException("Current user ID not found in claims.");
        }
        return adminId;
    }

    private static CrmNoteResponse MapToResponse(CrmNote note)
    {
        return new CrmNoteResponse
        {
            Id = note.Id,
            BookingId = note.BookingId,
            CrmLeadId = note.CrmLeadId,
            CreatedByAdminUserId = note.CreatedByAdminUserId ?? Guid.Empty,
            NoteText = note.NoteText,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }
}
