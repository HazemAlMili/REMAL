using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.CrmAssignments;
using RentalPlatform.API.DTOs.Responses.CrmAssignments;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "SalesOrSuperAdmin")]
public class CrmAssignmentsController : ControllerBase
{
    private readonly ICrmAssignmentService _assignmentService;

    public CrmAssignmentsController(ICrmAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    // 1. GET /api/internal/bookings/{bookingId}/assignment
    [HttpGet("api/internal/bookings/{bookingId}/assignment")]
    public async Task<ActionResult<ApiResponse<CrmAssignmentResponse>>> GetBookingAssignment(Guid bookingId)
    {
        var assignment = await _assignmentService.GetActiveForBookingAsync(bookingId);
        return Ok(ApiResponse<CrmAssignmentResponse>.CreateSuccess((assignment != null ? MapToResponse(assignment) : null)!));
    }

    // 2. POST /api/internal/bookings/{bookingId}/assignment
    [HttpPost("api/internal/bookings/{bookingId}/assignment")]
    public async Task<ActionResult<ApiResponse<CrmAssignmentResponse>>> AssignBooking(Guid bookingId, AssignBookingRequest request)
    {
        var assignment = await _assignmentService.AssignBookingAsync(bookingId, request.AssignedAdminUserId);
        return Ok(ApiResponse<CrmAssignmentResponse>.CreateSuccess(MapToResponse(assignment), "Booking assigned successfully."));
    }

    // 3. DELETE /api/internal/bookings/{bookingId}/assignment
    [HttpDelete("api/internal/bookings/{bookingId}/assignment")]
    public async Task<ActionResult<ApiResponse>> ClearBookingAssignment(Guid bookingId)
    {
        await _assignmentService.ClearBookingAssignmentAsync(bookingId);
        return Ok(ApiResponse.CreateSuccess(null, "Booking assignment cleared."));
    }

    // 4. GET /api/internal/crm/leads/{leadId}/assignment
    [HttpGet("api/internal/crm/leads/{leadId}/assignment")]
    public async Task<ActionResult<ApiResponse<CrmAssignmentResponse>>> GetLeadAssignment(Guid leadId)
    {
        var assignment = await _assignmentService.GetActiveForLeadAsync(leadId);
        return Ok(ApiResponse<CrmAssignmentResponse>.CreateSuccess((assignment != null ? MapToResponse(assignment) : null)!));
    }

    // 5. POST /api/internal/crm/leads/{leadId}/assignment
    [HttpPost("api/internal/crm/leads/{leadId}/assignment")]
    public async Task<ActionResult<ApiResponse<CrmAssignmentResponse>>> AssignLead(Guid leadId, AssignLeadRequest request)
    {
        var assignment = await _assignmentService.AssignLeadAsync(leadId, request.AssignedAdminUserId);
        return Ok(ApiResponse<CrmAssignmentResponse>.CreateSuccess(MapToResponse(assignment), "Lead assigned successfully."));
    }

    // 6. DELETE /api/internal/crm/leads/{leadId}/assignment
    [HttpDelete("api/internal/crm/leads/{leadId}/assignment")]
    public async Task<ActionResult<ApiResponse>> ClearLeadAssignment(Guid leadId)
    {
        await _assignmentService.ClearLeadAssignmentAsync(leadId);
        return Ok(ApiResponse.CreateSuccess(null, "Lead assignment cleared."));
    }

    private static CrmAssignmentResponse MapToResponse(CrmAssignment assignment)
    {
        return new CrmAssignmentResponse
        {
            Id = assignment.Id,
            BookingId = assignment.BookingId,
            CrmLeadId = assignment.CrmLeadId,
            AssignedAdminUserId = assignment.AssignedAdminUserId,
            IsActive = assignment.IsActive,
            AssignedAt = assignment.AssignedAt,
            UpdatedAt = assignment.UpdatedAt
        };
    }
}
