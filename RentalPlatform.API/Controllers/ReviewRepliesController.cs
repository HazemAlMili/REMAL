using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.ReviewReplies;
using RentalPlatform.API.DTOs.Responses.ReviewReplies;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/owner/reviews")]
[Authorize(Policy = "OwnerOnly")]
public class ReviewRepliesController : ControllerBase
{
    private readonly IReviewReplyService _reviewReplyService;

    public ReviewRepliesController(IReviewReplyService reviewReplyService)
    {
        _reviewReplyService = reviewReplyService;
    }

    [HttpGet("{reviewId:guid}/reply")]
    public async Task<ActionResult<ApiResponse<ReviewReplyResponse>>> GetReplyByReview(
        Guid reviewId,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var reply = await _reviewReplyService.GetByReviewIdAsync(reviewId, cancellationToken);
        if (reply == null || reply.OwnerId != ownerId)
            throw new NotFoundException($"Reply for review {reviewId} not found");

        return Ok(ApiResponse<ReviewReplyResponse>.CreateSuccess(MapToResponse(reply)));
    }

    [HttpPut("{reviewId:guid}/reply")]
    public async Task<ActionResult<ApiResponse<ReviewReplyResponse>>> CreateOrUpdateReply(
        Guid reviewId,
        [FromBody] CreateOrUpdateReviewReplyRequest request,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var reply = await _reviewReplyService.CreateOrUpdateAsync(
            reviewId,
            ownerId,
            request.ReplyText,
            request.IsVisible,
            cancellationToken);

        return Ok(ApiResponse<ReviewReplyResponse>.CreateSuccess(
            MapToResponse(reply),
            "Review reply saved successfully."));
    }

    [HttpPatch("{reviewId:guid}/reply/visibility")]
    public async Task<ActionResult<ApiResponse<ReviewReplyResponse>>> SetReplyVisibility(
        Guid reviewId,
        [FromBody] SetReviewReplyVisibilityRequest request,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var reply = await _reviewReplyService.SetVisibilityAsync(
            reviewId,
            ownerId,
            request.IsVisible,
            cancellationToken);

        return Ok(ApiResponse<ReviewReplyResponse>.CreateSuccess(
            MapToResponse(reply),
            "Review reply visibility updated successfully."));
    }

    [HttpDelete("{reviewId:guid}/reply")]
    public async Task<ActionResult<ApiResponse>> DeleteReply(
        Guid reviewId,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        await _reviewReplyService.DeleteAsync(reviewId, ownerId, cancellationToken);

        return Ok(ApiResponse.CreateSuccess(message: "Review reply deleted successfully."));
    }

    private Guid GetCurrentOwnerId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var ownerId))
            throw new UnauthorizedBusinessException("Current owner ID not found in claims.");

        return ownerId;
    }

    private static ReviewReplyResponse MapToResponse(ReviewReply reply)
    {
        return new ReviewReplyResponse
        {
            Id = reply.Id,
            ReviewId = reply.ReviewId,
            OwnerId = reply.OwnerId,
            ReplyText = reply.ReplyText,
            IsVisible = reply.IsVisible,
            CreatedAt = reply.CreatedAt,
            UpdatedAt = reply.UpdatedAt
        };
    }
}
