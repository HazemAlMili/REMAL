using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.PublicReviews;
using RentalPlatform.API.DTOs.Responses.PublicReviews;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/public/units/{unitId:guid}/reviews")]
public class PublicReviewsController : ControllerBase
{
    private readonly IReviewSummaryService _reviewSummaryService;

    public PublicReviewsController(IReviewSummaryService reviewSummaryService)
    {
        _reviewSummaryService = reviewSummaryService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<UnitPublishedReviewSummaryResponse>>> GetUnitReviewSummary(
        Guid unitId,
        CancellationToken cancellationToken)
    {
        var summary = await _reviewSummaryService.GetUnitSummaryAsync(unitId, cancellationToken);

        return Ok(ApiResponse<UnitPublishedReviewSummaryResponse>.CreateSuccess(MapToSummaryResponse(summary)));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PublishedReviewListItemResponse>>>> GetPublishedReviewsByUnit(
        Guid unitId,
        [FromQuery] GetPublishedReviewsByUnitRequest request,
        CancellationToken cancellationToken)
    {
        var reviews = await _reviewSummaryService.GetPublishedByUnitAsync(
            unitId,
            request.Page,
            request.PageSize,
            cancellationToken);

        var response = reviews.Select(MapToListItemResponse).ToList();

        return Ok(ApiResponse<IReadOnlyList<PublishedReviewListItemResponse>>.CreateSuccess(response));
    }

    [HttpGet("{reviewId:guid}")]
    public async Task<ActionResult<ApiResponse<PublishedReviewListItemResponse>>> GetPublishedReviewByUnitAndId(
        Guid unitId,
        Guid reviewId,
        CancellationToken cancellationToken)
    {
        var review = await _reviewSummaryService.GetPublishedByUnitAndReviewIdAsync(
            unitId,
            reviewId,
            cancellationToken);

        if (review == null)
            return NotFound(ApiResponse.CreateFailure($"Published review {reviewId} not found for unit {unitId}"));

        return Ok(ApiResponse<PublishedReviewListItemResponse>.CreateSuccess(MapToListItemResponse(review)));
    }

    private static UnitPublishedReviewSummaryResponse MapToSummaryResponse(UnitPublishedReviewSummaryResult summary)
    {
        return new UnitPublishedReviewSummaryResponse
        {
            UnitId = summary.UnitId,
            PublishedReviewCount = summary.PublishedReviewCount,
            AverageRating = summary.AverageRating,
            LastReviewPublishedAt = summary.LastReviewPublishedAt
        };
    }

    private static PublishedReviewListItemResponse MapToListItemResponse(PublishedReviewListItemResult review)
    {
        return new PublishedReviewListItemResponse
        {
            ReviewId = review.ReviewId,
            UnitId = review.UnitId,
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            PublishedAt = review.PublishedAt,
            OwnerReplyText = review.OwnerReplyText,
            OwnerReplyUpdatedAt = review.OwnerReplyUpdatedAt
        };
    }
}
