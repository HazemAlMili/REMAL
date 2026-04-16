using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Areas;

namespace RentalPlatform.API.Validators;

public class CreateAreaRequestValidator : AbstractValidator<CreateAreaRequest>
{
    public CreateAreaRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
    }
}

public class UpdateAreaRequestValidator : AbstractValidator<UpdateAreaRequest>
{
    public UpdateAreaRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
    }
}

public class UpdateAreaStatusRequestValidator : AbstractValidator<UpdateAreaStatusRequest>
{
    public UpdateAreaStatusRequestValidator()
    {
        RuleFor(x => x.IsActive).NotNull().WithMessage("IsActive status is required.");
    }
}
