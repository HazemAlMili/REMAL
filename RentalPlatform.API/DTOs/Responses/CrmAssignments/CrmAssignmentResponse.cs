using System;

namespace RentalPlatform.API.DTOs.Responses.CrmAssignments;

public record CrmAssignmentResponse
{
    public Guid Id { get; init; }
    public Guid? BookingId { get; init; }
    public Guid? CrmLeadId { get; init; }
    public Guid AssignedAdminUserId { get; init; }
    public bool IsActive { get; init; }
    public DateTime AssignedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
