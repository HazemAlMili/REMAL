using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Units;
using System.Linq;

namespace RentalPlatform.API.Validators;

public class CreateUnitRequestValidator : AbstractValidator<CreateUnitRequest>
{
    private static readonly string[] AllowedUnitTypes = { "apartment", "villa", "chalet", "studio" };

    public CreateUnitRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Name is required and cannot be empty or whitespace.");

        RuleFor(x => x.UnitType)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x) && AllowedUnitTypes.Contains(x.Trim().ToLower()))
            .WithMessage($"UnitType must be one of: {string.Join(", ", AllowedUnitTypes)}.");

        RuleFor(x => x.Bedrooms)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Bedrooms must be greater than or equal to 0.");

        RuleFor(x => x.Bathrooms)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Bathrooms must be greater than or equal to 0.");

        RuleFor(x => x.MaxGuests)
            .GreaterThan(0)
            .WithMessage("MaxGuests must be greater than 0.");

        RuleFor(x => x.BasePricePerNight)
            .GreaterThanOrEqualTo(0)
            .WithMessage("BasePricePerNight must be greater than or equal to 0.");
    }
}

public class UpdateUnitRequestValidator : AbstractValidator<UpdateUnitRequest>
{
    private static readonly string[] AllowedUnitTypes = { "apartment", "villa", "chalet", "studio" };

    public UpdateUnitRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Name is required and cannot be empty or whitespace.");

        RuleFor(x => x.UnitType)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x) && AllowedUnitTypes.Contains(x.Trim().ToLower()))
            .WithMessage($"UnitType must be one of: {string.Join(", ", AllowedUnitTypes)}.");

        RuleFor(x => x.Bedrooms)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Bedrooms must be greater than or equal to 0.");

        RuleFor(x => x.Bathrooms)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Bathrooms must be greater than or equal to 0.");

        RuleFor(x => x.MaxGuests)
            .GreaterThan(0)
            .WithMessage("MaxGuests must be greater than 0.");

        RuleFor(x => x.BasePricePerNight)
            .GreaterThanOrEqualTo(0)
            .WithMessage("BasePricePerNight must be greater than or equal to 0.");
    }
}

public class UpdateUnitStatusRequestValidator : AbstractValidator<UpdateUnitStatusRequest>
{
    public UpdateUnitStatusRequestValidator()
    {
        // No explicit rules for IsActive, as boolean is self-validating
    }
}
