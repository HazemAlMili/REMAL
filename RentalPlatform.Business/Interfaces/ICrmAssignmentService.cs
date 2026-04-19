using System;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface ICrmAssignmentService
{
    Task<CrmAssignment?> GetActiveForBookingAsync(Guid bookingId, CancellationToken cancellationToken = default);
    Task<CrmAssignment?> GetActiveForLeadAsync(Guid leadId, CancellationToken cancellationToken = default);
    Task<CrmAssignment> AssignBookingAsync(Guid bookingId, Guid assignedAdminUserId, CancellationToken cancellationToken = default);
    Task<CrmAssignment> AssignLeadAsync(Guid leadId, Guid assignedAdminUserId, CancellationToken cancellationToken = default);
    Task ClearBookingAssignmentAsync(Guid bookingId, CancellationToken cancellationToken = default);
    Task ClearLeadAssignmentAsync(Guid leadId, CancellationToken cancellationToken = default);
}
