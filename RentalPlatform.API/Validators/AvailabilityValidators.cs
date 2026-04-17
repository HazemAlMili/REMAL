using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Availability;

namespace RentalPlatform.API.Validators;

public class CheckOperationalAvailabilityRequestValidator : AbstractValidator<CheckOperationalAvailabilityRequest>
{
    public CheckOperationalAvailabilityRequestValidator()
    {
        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("StartDate must be less than or equal to EndDate.");
    }
}
