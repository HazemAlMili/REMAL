using FluentValidation;
using RentalPlatform.API.DTOs.Requests.UnitAmenities;

namespace RentalPlatform.API.Validators;

public class ReplaceUnitAmenitiesRequestValidator : AbstractValidator<ReplaceUnitAmenitiesRequest>
{
    public ReplaceUnitAmenitiesRequestValidator()
    {
        RuleFor(x => x.AmenityIds)
            .NotNull()
            .WithMessage("AmenityIds array cannot be null.");
    }
}

public class AssignUnitAmenityRequestValidator : AbstractValidator<AssignUnitAmenityRequest>
{
    public AssignUnitAmenityRequestValidator()
    {
        RuleFor(x => x.AmenityId)
            .NotEmpty()
            .WithMessage("AmenityId cannot be empty.");
    }
}
