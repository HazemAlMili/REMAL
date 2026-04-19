using System;

namespace RentalPlatform.API.DTOs.Requests.CrmAssignments;

public record AssignBookingRequest
{
    public Guid AssignedAdminUserId { get; init; }
}

public record AssignLeadRequest
{
    public Guid AssignedAdminUserId { get; init; }
}
