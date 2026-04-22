using FluentValidation;
using RentalPlatform.API.DTOs.Requests.ReportsAnalytics;

namespace RentalPlatform.API.Validators.ReportsAnalytics;

public class GetBookingAnalyticsRequestValidator : AbstractValidator<GetBookingAnalyticsRequest>
{
    public GetBookingAnalyticsRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page must be 1 or greater.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageSize must be 1 or greater.")
            .LessThanOrEqualTo(100)
            .WithMessage("PageSize must not exceed 100.");

        RuleFor(x => x)
            .Must(x => x.DateFrom is null || x.DateTo is null || x.DateFrom <= x.DateTo)
            .WithMessage("DateFrom must be on or before DateTo.")
            .When(x => x.DateFrom.HasValue && x.DateTo.HasValue);

        RuleFor(x => x.BookingSource)
            .Must(s => s is null || !string.IsNullOrWhiteSpace(s))
            .WithMessage("BookingSource must not be blank when provided.");
    }
}

public class GetFinanceAnalyticsRequestValidator : AbstractValidator<GetFinanceAnalyticsRequest>
{
    public GetFinanceAnalyticsRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page must be 1 or greater.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageSize must be 1 or greater.")
            .LessThanOrEqualTo(100)
            .WithMessage("PageSize must not exceed 100.");

        RuleFor(x => x)
            .Must(x => x.DateFrom is null || x.DateTo is null || x.DateFrom <= x.DateTo)
            .WithMessage("DateFrom must be on or before DateTo.")
            .When(x => x.DateFrom.HasValue && x.DateTo.HasValue);
    }
}

public class GetReviewsAnalyticsRequestValidator : AbstractValidator<GetReviewsAnalyticsRequest>
{
    public GetReviewsAnalyticsRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page must be 1 or greater.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageSize must be 1 or greater.")
            .LessThanOrEqualTo(100)
            .WithMessage("PageSize must not exceed 100.");

        RuleFor(x => x)
            .Must(x => x.DateFrom is null || x.DateTo is null || x.DateFrom <= x.DateTo)
            .WithMessage("DateFrom must be on or before DateTo.")
            .When(x => x.DateFrom.HasValue && x.DateTo.HasValue);
    }
}

public class GetNotificationsAnalyticsRequestValidator : AbstractValidator<GetNotificationsAnalyticsRequest>
{
    private static readonly string[] AllowedChannels =
        ["in_app", "email", "sms", "whatsapp"];

    public GetNotificationsAnalyticsRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page must be 1 or greater.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageSize must be 1 or greater.")
            .LessThanOrEqualTo(100)
            .WithMessage("PageSize must not exceed 100.");

        RuleFor(x => x)
            .Must(x => x.DateFrom is null || x.DateTo is null || x.DateFrom <= x.DateTo)
            .WithMessage("DateFrom must be on or before DateTo.")
            .When(x => x.DateFrom.HasValue && x.DateTo.HasValue);

        RuleFor(x => x.Channel)
            .Must(c => c is null || !string.IsNullOrWhiteSpace(c))
            .WithMessage("Channel must not be blank when provided.");

        RuleFor(x => x.Channel)
            .Must(c => c is null || AllowedChannels.Contains(c.Trim().ToLowerInvariant()))
            .WithMessage($"Channel must be one of: {string.Join(", ", AllowedChannels)}.")
            .When(x => x.Channel is not null && !string.IsNullOrWhiteSpace(x.Channel));
    }
}
