using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Amenities;

namespace RentalPlatform.API.Validators;

public class CreateAmenityRequestValidator : AbstractValidator<CreateAmenityRequest>
{
    public CreateAmenityRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
    }
}

public class UpdateAmenityRequestValidator : AbstractValidator<UpdateAmenityRequest>
{
    public UpdateAmenityRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
    }
}
