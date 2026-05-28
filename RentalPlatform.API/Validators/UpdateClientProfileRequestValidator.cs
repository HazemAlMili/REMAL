using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Clients;

namespace RentalPlatform.API.Validators;

public class UpdateClientProfileRequestValidator : AbstractValidator<UpdateClientProfileRequest>
{
    public UpdateClientProfileRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Phone).NotEmpty().WithMessage("Phone is required.");
        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Invalid email format.");
    }
}