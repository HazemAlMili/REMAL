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
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/internal/reviews/{reviewId:guid}")]
[Authorize(Policy = "SalesOrSuperAdmin")]
public class ReviewModerationController : ControllerBase
{
    private readonly IReviewModerationService _reviewModerationService;

    public ReviewModerationController(IReviewModerationService reviewModerationService)
    {
        _reviewModerationService = reviewModerationService;
    }

    [HttpPost("publish")]
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

    [HttpPost("reject")]
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

    [HttpPost("hide")]
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

    [HttpGet("status-history")]
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
            ReviewStatus = review.ReviewStatus,
            SubmittedAt = review.SubmittedAt,
            PublishedAt = review.PublishedAt,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt
        };
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
