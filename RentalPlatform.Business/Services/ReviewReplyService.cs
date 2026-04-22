using System;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class ReviewReplyService : IReviewReplyService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewReplyService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ReviewReply?> GetByReviewIdAsync(
        Guid reviewId,
        CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.ReviewReplies.FirstOrDefaultAsync(
            rr => rr.ReviewId == reviewId, cancellationToken);
    }

    public async Task<ReviewReply> CreateOrUpdateAsync(
        Guid reviewId,
        Guid ownerId,
        string replyText,
        bool isVisible,
        CancellationToken cancellationToken = default)
    {
        var trimmedText = replyText?.Trim();
        if (string.IsNullOrEmpty(trimmedText))
            throw new BusinessValidationException("Reply text is required and cannot be blank.");

        var review = await GetReviewOrThrowAsync(reviewId, cancellationToken);
        await ValidateOwnerAsync(ownerId, cancellationToken);
        ValidateOwnerOwnsReview(review, ownerId);

        // Reply creation/update only allowed when review is published
        if (review.ReviewStatus != "published")
            throw new ConflictException(
                $"Cannot create or update a reply for review {reviewId}: review status is '{review.ReviewStatus}'. Replies are only allowed on published reviews.");

        var existing = await _unitOfWork.ReviewReplies.FirstOrDefaultAsync(
            rr => rr.ReviewId == reviewId, cancellationToken);

        if (existing == null)
        {
            var reply = new ReviewReply
            {
                ReviewId  = reviewId,
                OwnerId   = ownerId,
                ReplyText = trimmedText,
                IsVisible = isVisible
            };

            await _unitOfWork.ReviewReplies.AddAsync(reply, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return reply;
        }

        existing.ReplyText = trimmedText;
        existing.IsVisible = isVisible;

        _unitOfWork.ReviewReplies.Update(existing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return existing;
    }

    public async Task<ReviewReply> SetVisibilityAsync(
        Guid reviewId,
        Guid ownerId,
        bool isVisible,
        CancellationToken cancellationToken = default)
    {
        var review = await GetReviewOrThrowAsync(reviewId, cancellationToken);
        await ValidateOwnerAsync(ownerId, cancellationToken);
        ValidateOwnerOwnsReview(review, ownerId);

        var reply = await _unitOfWork.ReviewReplies.FirstOrDefaultAsync(
            rr => rr.ReviewId == reviewId, cancellationToken);
        if (reply == null)
            throw new NotFoundException($"No reply found for review {reviewId}");

        reply.IsVisible = isVisible;

        _unitOfWork.ReviewReplies.Update(reply);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return reply;
    }

    public async Task DeleteAsync(
        Guid reviewId,
        Guid ownerId,
        CancellationToken cancellationToken = default)
    {
        var review = await GetReviewOrThrowAsync(reviewId, cancellationToken);
        await ValidateOwnerAsync(ownerId, cancellationToken);
        ValidateOwnerOwnsReview(review, ownerId);

        var reply = await _unitOfWork.ReviewReplies.FirstOrDefaultAsync(
            rr => rr.ReviewId == reviewId, cancellationToken);
        if (reply == null)
            throw new NotFoundException($"No reply found for review {reviewId}");

        _unitOfWork.ReviewReplies.Delete(reply);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // -------------------------------------------------------------------------
    private async Task<Review> GetReviewOrThrowAsync(Guid reviewId, CancellationToken cancellationToken)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId, cancellationToken);
        if (review == null)
            throw new NotFoundException($"Review with ID {reviewId} not found");
        return review;
    }

    private async Task ValidateOwnerAsync(Guid ownerId, CancellationToken cancellationToken)
    {
        var ownerExists = await _unitOfWork.Owners.ExistsAsync(
            o => o.Id == ownerId && o.DeletedAt == null, cancellationToken);
        if (!ownerExists)
            throw new NotFoundException($"Active owner with ID {ownerId} not found");
    }

    private static void ValidateOwnerOwnsReview(Review review, Guid ownerId)
    {
        if (review.OwnerId != ownerId)
            throw new ConflictException(
                $"Owner {ownerId} does not own review {review.Id}");
    }
}
