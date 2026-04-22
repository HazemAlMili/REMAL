using FluentValidation;
using RentalPlatform.API.DTOs.Requests.PublicReviews;
using RentalPlatform.API.DTOs.Requests.ReviewReplies;
using RentalPlatform.API.DTOs.Requests.Reviews;

namespace RentalPlatform.API.Validators.Reviews;

public class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.BookingId)
            .NotEmpty()
            .WithMessage("BookingId is required.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5)
            .WithMessage("Rating must be between 1 and 5.");

        RuleFor(x => x.Title)
            .MaximumLength(150)
            .WithMessage("Title must not exceed 150 characters.")
            .When(x => x.Title != null);
    }
}

public class UpdatePendingReviewRequestValidator : AbstractValidator<UpdatePendingReviewRequest>
{
    public UpdatePendingReviewRequestValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5)
            .WithMessage("Rating must be between 1 and 5.");

        RuleFor(x => x.Title)
            .MaximumLength(150)
            .WithMessage("Title must not exceed 150 characters.")
            .When(x => x.Title != null);
    }
}

public class CreateOrUpdateReviewReplyRequestValidator : AbstractValidator<CreateOrUpdateReviewReplyRequest>
{
    public CreateOrUpdateReviewReplyRequestValidator()
    {
        RuleFor(x => x.ReplyText)
            .NotEmpty()
            .WithMessage("ReplyText is required.")
            .Must(text => !string.IsNullOrWhiteSpace(text))
            .WithMessage("ReplyText cannot be blank or whitespace only.");
    }
}

public class GetPublishedReviewsByUnitRequestValidator : AbstractValidator<GetPublishedReviewsByUnitRequest>
{
    public GetPublishedReviewsByUnitRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page must be 1 or greater.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageSize must be 1 or greater.")
            .LessThanOrEqualTo(100)
            .WithMessage("PageSize must not exceed 100.");
    }
}
