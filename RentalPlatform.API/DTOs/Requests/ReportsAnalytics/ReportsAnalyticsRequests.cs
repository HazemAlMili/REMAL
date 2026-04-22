using System;

namespace RentalPlatform.API.DTOs.Requests.ReportsAnalytics;

public record GetBookingAnalyticsRequest
{
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public string? BookingSource { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 30;
}

public record GetFinanceAnalyticsRequest
{
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 30;
}

public record GetReviewsAnalyticsRequest
{
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 30;
}

public record GetNotificationsAnalyticsRequest
{
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public string? Channel { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 30;
}
