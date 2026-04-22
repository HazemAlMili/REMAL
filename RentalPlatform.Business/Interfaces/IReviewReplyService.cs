using System;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IReviewReplyService
{
    Task<ReviewReply?> GetByReviewIdAsync(Guid reviewId, CancellationToken cancellationToken = default);

    Task<ReviewReply> CreateOrUpdateAsync(
        Guid reviewId,
        Guid ownerId,
        string replyText,
        bool isVisible,
        CancellationToken cancellationToken = default);

    Task<ReviewReply> SetVisibilityAsync(
        Guid reviewId,
        Guid ownerId,
        bool isVisible,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid reviewId, Guid ownerId, CancellationToken cancellationToken = default);
}
