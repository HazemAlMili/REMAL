using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface ICrmNoteService
{
    Task<IReadOnlyList<CrmNote>> GetByBookingIdAsync(Guid bookingId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CrmNote>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default);
    Task<CrmNote> AddToBookingAsync(Guid bookingId, Guid? createdByAdminUserId, string noteText, CancellationToken cancellationToken = default);
    Task<CrmNote> AddToLeadAsync(Guid leadId, Guid? createdByAdminUserId, string noteText, CancellationToken cancellationToken = default);
    Task<CrmNote> UpdateAsync(Guid id, string noteText, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
