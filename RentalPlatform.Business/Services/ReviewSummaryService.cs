using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data;

namespace RentalPlatform.Business.Services;

public class ReviewSummaryService : IReviewSummaryService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewSummaryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<UnitPublishedReviewSummaryResult> GetUnitSummaryAsync(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        await EnsureUnitExistsAsync(unitId, cancellationToken);

        var summary = await _unitOfWork.UnitReviewSummaries.GetByIdAsync(unitId, cancellationToken);

        if (summary == null)
        {
            return new UnitPublishedReviewSummaryResult
            {
                UnitId               = unitId,
                PublishedReviewCount = 0,
                AverageRating        = 0.00m,
                LastReviewPublishedAt = null
            };
        }

        return new UnitPublishedReviewSummaryResult
        {
            UnitId                = summary.UnitId,
            PublishedReviewCount  = summary.PublishedReviewCount,
            AverageRating         = summary.AverageRating,
            LastReviewPublishedAt = summary.LastReviewPublishedAt
        };
    }

    public async Task<IReadOnlyList<PublishedReviewListItemResult>> GetPublishedByUnitAsync(
        Guid unitId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
            throw new BusinessValidationException("Page must be 1 or greater.");
        if (pageSize < 1 || pageSize > 100)
            throw new BusinessValidationException("PageSize must be between 1 and 100.");

        await EnsureUnitExistsAsync(unitId, cancellationToken);

        var reviews = await _unitOfWork.Reviews.Query()
            .Include(r => r.Client)
            .Where(r => r.UnitId == unitId && r.ReviewStatus == "published")
            .OrderByDescending(r => r.PublishedAt)
            .ThenByDescending(r => r.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var reviewIds = reviews.Select(r => r.Id).ToList();

        // Load visible replies for the current page batch
        var visibleReplies = await _unitOfWork.ReviewReplies.Query()
            .Include(rr => rr.Owner)
            .Where(rr => reviewIds.Contains(rr.ReviewId) && rr.IsVisible)
            .ToListAsync(cancellationToken);

        var replyMap = visibleReplies.ToDictionary(rr => rr.ReviewId);

        return reviews.Select(r =>
        {
            replyMap.TryGetValue(r.Id, out var reply);
            return new PublishedReviewListItemResult
            {
                ReviewId           = r.Id,
                UnitId             = r.UnitId,
                Rating             = r.Rating,
                Title              = r.Title,
                Comment            = r.Comment,
                PublishedAt        = r.PublishedAt!.Value,
                OwnerReplyText     = reply?.ReplyText,
                OwnerReplyUpdatedAt = reply?.UpdatedAt,
                OwnerReplyAt       = reply != null ? DateTime.SpecifyKind(reply.UpdatedAt, DateTimeKind.Utc) : null,
                OwnerName          = reply?.Owner?.Name,
                ClientDisplayName  = FormatDisplayName(r.Client?.Name)
            };
        }).ToList();
    }

    public async Task<PublishedReviewListItemResult?> GetPublishedByUnitAndReviewIdAsync(
        Guid unitId,
        Guid reviewId,
        CancellationToken cancellationToken = default)
    {
        await EnsureUnitExistsAsync(unitId, cancellationToken);

        var review = await _unitOfWork.Reviews.Query()
            .Include(r => r.Client)
            .FirstOrDefaultAsync(
                r => r.Id == reviewId && r.UnitId == unitId && r.ReviewStatus == "published",
                cancellationToken);

        if (review == null)
            throw new NotFoundException(
                $"Published review {reviewId} not found for unit {unitId}");

        var reply = await _unitOfWork.ReviewReplies.Query()
            .Include(rr => rr.Owner)
            .FirstOrDefaultAsync(rr => rr.ReviewId == reviewId && rr.IsVisible, cancellationToken);

        return new PublishedReviewListItemResult
        {
            ReviewId            = review.Id,
            UnitId              = review.UnitId,
            Rating              = review.Rating,
            Title               = review.Title,
            Comment             = review.Comment,
            PublishedAt         = review.PublishedAt!.Value,
            OwnerReplyText      = reply?.ReplyText,
            OwnerReplyUpdatedAt = reply?.UpdatedAt,
            OwnerReplyAt        = reply != null ? DateTime.SpecifyKind(reply.UpdatedAt, DateTimeKind.Utc) : null,
            OwnerName           = reply?.Owner?.Name,
            ClientDisplayName   = FormatDisplayName(review.Client?.Name)
        };
    }

    // -------------------------------------------------------------------------
    /// <summary>
    /// Formats a raw client name as "FirstName L." for display.
    /// Normalizes all Unicode whitespace (including non-breaking space \u00A0
    /// that may arrive from Arabic-keyboard input or copy-paste) before
    /// tokenizing, so two-part names are always parsed correctly.
    /// Returns null when the input is blank so the caller can fall back to
    /// an anonymous placeholder.
    /// </summary>
    private static string? FormatDisplayName(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return null;

        // Collapse all Unicode whitespace variants (\u00A0, \t, etc.) into a
        // single regular space, then trim leading/trailing whitespace.
        var normalized = Regex.Replace(fullName, @"\s+", " ").Trim();
        if (normalized.Length == 0) return null;

        var parts = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return null;
        if (parts.Length == 1) return parts[0];

        var firstName = parts[0];
        var lastPart  = parts[parts.Length - 1];
        // Guard: lastPart is guaranteed non-empty by RemoveEmptyEntries
        return $"{firstName} {char.ToUpper(lastPart[0])}.";  // e.g. "Ahmed G."
    }

    private async Task EnsureUnitExistsAsync(Guid unitId, CancellationToken cancellationToken)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(
            u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit with ID {unitId} not found");
    }
}
