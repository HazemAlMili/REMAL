using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IReviewService
{
    Task<IReadOnlyList<Review>> GetAllAsync(
        string? reviewStatus = null,
        Guid? unitId = null,
        Guid? clientId = null,
        Guid? ownerId = null,
        CancellationToken cancellationToken = default);

    Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Review?> GetByBookingIdAsync(Guid bookingId, CancellationToken cancellationToken = default);

    Task<Review> CreateAsync(
        Guid bookingId,
        Guid clientId,
        int rating,
        string? title,
        string? comment,
        CancellationToken cancellationToken = default);

    Task<Review> UpdatePendingAsync(
        Guid reviewId,
        Guid clientId,
        int rating,
        string? title,
        string? comment,
        CancellationToken cancellationToken = default);
}
