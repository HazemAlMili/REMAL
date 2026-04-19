using System;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IBookingLifecycleService
{
    Task<Booking> ConfirmAsync(Guid bookingId, Guid changedByAdminUserId, string? notes, CancellationToken cancellationToken = default);
    Task<Booking> CancelAsync(Guid bookingId, Guid changedByAdminUserId, string? notes, CancellationToken cancellationToken = default);
    Task<Booking> CompleteAsync(Guid bookingId, Guid changedByAdminUserId, string? notes, CancellationToken cancellationToken = default);
}
