using FluentValidation;
using RentalPlatform.API.DTOs.Requests.SeasonalPricing;

namespace RentalPlatform.API.Validators;

public class CreateSeasonalPricingRequestValidator : AbstractValidator<CreateSeasonalPricingRequest>
{
    public CreateSeasonalPricingRequestValidator()
    {
        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("StartDate must be less than or equal to EndDate.");

        RuleFor(x => x.PricePerNight)
            .GreaterThanOrEqualTo(0)
            .WithMessage("PricePerNight must be greater than or equal to 0.");
    }
}

public class UpdateSeasonalPricingRequestValidator : AbstractValidator<UpdateSeasonalPricingRequest>
{
    public UpdateSeasonalPricingRequestValidator()
    {
        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("StartDate must be less than or equal to EndDate.");

        RuleFor(x => x.PricePerNight)
            .GreaterThanOrEqualTo(0)
            .WithMessage("PricePerNight must be greater than or equal to 0.");
    }
}
