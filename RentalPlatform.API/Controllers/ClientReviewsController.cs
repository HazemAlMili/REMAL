using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.Reviews;
using RentalPlatform.API.DTOs.Responses.Reviews;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/client/reviews")]
[Authorize(Policy = "ClientOnly")]
public class ClientReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ClientReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ReviewResponse>>> CreateReview(
        [FromBody] CreateReviewRequest request,
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();

        var review = await _reviewService.CreateAsync(
            request.BookingId,
            clientId,
            request.Rating,
            request.Title,
            request.Comment,
            cancellationToken);

        return Ok(ApiResponse<ReviewResponse>.CreateSuccess(
            MapToResponse(review),
            "Review created successfully."));
    }

    [HttpPut("{reviewId:guid}")]
    public async Task<ActionResult<ApiResponse<ReviewResponse>>> UpdatePendingReview(
        Guid reviewId,
        [FromBody] UpdatePendingReviewRequest request,
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();

        var review = await _reviewService.UpdatePendingAsync(
            reviewId,
            clientId,
            request.Rating,
            request.Title,
            request.Comment,
            cancellationToken);

        return Ok(ApiResponse<ReviewResponse>.CreateSuccess(
            MapToResponse(review),
            "Review updated successfully."));
    }

    [HttpGet("by-booking/{bookingId:guid}")]
    public async Task<ActionResult<ApiResponse<ReviewResponse>>> GetOwnReviewByBooking(
        Guid bookingId,
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();

        var review = await _reviewService.GetByBookingIdAsync(bookingId, cancellationToken);
        if (review == null || review.ClientId != clientId)
            throw new NotFoundException($"Review for booking {bookingId} not found");

        return Ok(ApiResponse<ReviewResponse>.CreateSuccess(MapToResponse(review)));
    }

    private Guid GetCurrentClientId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var clientId))
            throw new UnauthorizedBusinessException("Current client ID not found in claims.");

        return clientId;
    }

    private static ReviewResponse MapToResponse(Review review)
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
}
