using FluentValidation;
using RentalPlatform.API.DTOs.Requests.DateBlocks;

namespace RentalPlatform.API.Validators;

public class CreateDateBlockRequestValidator : AbstractValidator<CreateDateBlockRequest>
{
    public CreateDateBlockRequestValidator()
    {
        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("StartDate must be less than or equal to EndDate.");
            
        RuleFor(x => x.Reason)
            .Must(x => string.IsNullOrEmpty(x) || !string.IsNullOrWhiteSpace(x))
            .WithMessage("Reason cannot be only whitespace if provided.");
    }
}

public class UpdateDateBlockRequestValidator : AbstractValidator<UpdateDateBlockRequest>
{
    public UpdateDateBlockRequestValidator()
    {
        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("StartDate must be less than or equal to EndDate.");
            
        RuleFor(x => x.Reason)
            .Must(x => string.IsNullOrEmpty(x) || !string.IsNullOrWhiteSpace(x))
            .WithMessage("Reason cannot be only whitespace if provided.");
    }
}
