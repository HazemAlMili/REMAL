using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IReviewModerationService
{
    Task<Review> PublishAsync(
        Guid reviewId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default);

    Task<Review> RejectAsync(
        Guid reviewId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default);

    Task<Review> HideAsync(
        Guid reviewId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ReviewStatusHistory>> GetStatusHistoryAsync(
        Guid reviewId,
        CancellationToken cancellationToken = default);
}
