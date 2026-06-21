using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.ReviewModeration;
using RentalPlatform.API.DTOs.Responses.ReviewModeration;
using RentalPlatform.API.DTOs.Responses.Reviews;
using RentalPlatform.API.Models;
using RentalPlatform.API.Authorization;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/internal/reviews")]
[Authorize(Policy = PermissionKeys.ReviewsModerate)]
public class ReviewModerationController : ControllerBase
{
    private readonly IReviewModerationService _reviewModerationService;

    public ReviewModerationController(IReviewModerationService reviewModerationService)
    {
        _reviewModerationService = reviewModerationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReviewResponse>>>> GetAllReviews(
        [FromQuery] string? reviewStatus,
        [FromQuery] Guid? unitId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var (reviews, totalCount) = await _reviewModerationService.GetPagedReviewsAsync(
            reviewStatus,
            unitId,
            page,
            pageSize,
            cancellationToken);

        var response = reviews.Select(MapToReviewResponse).ToList();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        var pagination = new PaginationMeta(totalCount, page, pageSize, totalPages);

        return Ok(ApiResponse<IReadOnlyList<ReviewResponse>>.CreateSuccess(response, pagination: pagination));
    }

    [HttpPost("{reviewId:guid}/publish")]
    public async Task<ActionResult<ApiResponse<ReviewResponse>>> PublishReview(
        Guid reviewId,
        [FromBody] PublishReviewRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();

        var review = await _reviewModerationService.PublishAsync(
            reviewId,
            adminId,
            request.Notes,
            cancellationToken);

        return Ok(ApiResponse<ReviewResponse>.CreateSuccess(
            MapToReviewResponse(review),
            "Review published successfully."));
    }

    [HttpPost("{reviewId:guid}/reject")]
    public async Task<ActionResult<ApiResponse<ReviewResponse>>> RejectReview(
        Guid reviewId,
        [FromBody] RejectReviewRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();

        var review = await _reviewModerationService.RejectAsync(
            reviewId,
            adminId,
            request.Notes,
            cancellationToken);

        return Ok(ApiResponse<ReviewResponse>.CreateSuccess(
            MapToReviewResponse(review),
            "Review rejected successfully."));
    }

    [HttpPost("{reviewId:guid}/hide")]
    public async Task<ActionResult<ApiResponse<ReviewResponse>>> HideReview(
        Guid reviewId,
        [FromBody] HideReviewRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();

        var review = await _reviewModerationService.HideAsync(
            reviewId,
            adminId,
            request.Notes,
            cancellationToken);

        return Ok(ApiResponse<ReviewResponse>.CreateSuccess(
            MapToReviewResponse(review),
            "Review hidden successfully."));
    }

    [HttpGet("{reviewId:guid}/status-history")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReviewStatusHistoryResponse>>>> GetReviewStatusHistory(
        Guid reviewId,
        CancellationToken cancellationToken)
    {
        var historyRows = await _reviewModerationService.GetStatusHistoryAsync(reviewId, cancellationToken);
        var response = historyRows.Select(MapToStatusHistoryResponse).ToList();

        return Ok(ApiResponse<IReadOnlyList<ReviewStatusHistoryResponse>>.CreateSuccess(response));
    }

    private Guid GetCurrentAdminId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var adminId))
            throw new UnauthorizedBusinessException("Current admin user ID not found in claims.");

        return adminId;
    }

    private static ReviewResponse MapToReviewResponse(Review review)
    {
        return new ReviewResponse
        {
            Id = review.Id,
            BookingId = review.BookingId,
            UnitId = review.UnitId,
            ClientId = review.ClientId,
            OwnerId = review.OwnerId,
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            ReviewStatus = MapStatus(review.ReviewStatus),
            SubmittedAt = review.SubmittedAt,
            PublishedAt = review.PublishedAt,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt,
            UnitName = review.Unit?.Name ?? "Deleted Unit",
            ClientName = review.Client?.Name ?? "Deleted Client",
            OwnerReplyText = review.Reply?.ReplyText,
            OwnerReplyUpdatedAt = review.Reply?.UpdatedAt
        };
    }

    private static string MapStatus(string status)
    {
        if (string.IsNullOrWhiteSpace(status)) return string.Empty;
        return char.ToUpper(status[0]) + status.Substring(1).ToLower();
    }

    private static ReviewStatusHistoryResponse MapToStatusHistoryResponse(ReviewStatusHistory history)
    {
        return new ReviewStatusHistoryResponse
        {
            Id = history.Id,
            ReviewId = history.ReviewId,
            OldStatus = history.OldStatus,
            NewStatus = history.NewStatus,
            ChangedByAdminUserId = history.ChangedByAdminUserId,
            Notes = history.Notes,
            ChangedAt = history.ChangedAt
        };
    }
}
