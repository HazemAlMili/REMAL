using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IBookingService
{
    Task<IReadOnlyList<Booking>> GetAllAsync(string? bookingStatus = null, Guid? assignedAdminUserId = null, CancellationToken cancellationToken = default);
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Booking> CreateAsync(Guid clientId, Guid unitId, DateOnly checkInDate, DateOnly checkOutDate, int guestCount, string source, Guid? assignedAdminUserId, string? internalNotes, CancellationToken cancellationToken = default);
    Task<Booking> UpdatePendingAsync(Guid id, DateOnly checkInDate, DateOnly checkOutDate, int guestCount, string source, Guid? assignedAdminUserId, string? internalNotes, CancellationToken cancellationToken = default);
}
