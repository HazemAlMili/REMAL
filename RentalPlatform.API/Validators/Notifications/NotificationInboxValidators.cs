using FluentValidation;
using RentalPlatform.API.DTOs.Requests.NotificationInbox;

namespace RentalPlatform.API.Validators.Notifications;

public class GetInboxRequestValidator : AbstractValidator<GetInboxRequest>
{
    public GetInboxRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1).WithMessage("Page must be >= 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("PageSize must be >= 1.")
            .LessThanOrEqualTo(100).WithMessage("PageSize must be <= 100.");
    }
}
