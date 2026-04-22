using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IOwnerPayoutService
{
    Task<OwnerPayout?> GetByBookingIdAsync(Guid bookingId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OwnerPayout>> GetByOwnerIdAsync(
        Guid ownerId,
        string? payoutStatus = null,
        CancellationToken cancellationToken = default);

    Task<OwnerPayout> CreateOrUpdateFromBookingAsync(
        Guid bookingId,
        decimal commissionRate,
        string? notes,
        CancellationToken cancellationToken = default);

    Task<OwnerPayout> SetScheduledAsync(Guid payoutId, string? notes, CancellationToken cancellationToken = default);
    Task<OwnerPayout> MarkPaidAsync(Guid payoutId, string? notes, CancellationToken cancellationToken = default);
    Task<OwnerPayout> CancelAsync(Guid payoutId, string? notes, CancellationToken cancellationToken = default);
}
