using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Models;

namespace RentalPlatform.Business.Interfaces;

public interface IReviewSummaryService
{
    Task<UnitPublishedReviewSummaryResult> GetUnitSummaryAsync(
        Guid unitId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PublishedReviewListItemResult>> GetPublishedByUnitAsync(
        Guid unitId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<PublishedReviewListItemResult?> GetPublishedByUnitAndReviewIdAsync(
        Guid unitId,
        Guid reviewId,
        CancellationToken cancellationToken = default);
}
