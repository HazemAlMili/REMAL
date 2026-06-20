using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Auth;

namespace RentalPlatform.API.Validators;

public class ClientRegisterRequestValidator : AbstractValidator<ClientRegisterRequest>
{
    public ClientRegisterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Phone)
            .NotEmpty()
            .Matches(@"^\+?\d{10,15}$")
            .WithMessage("Phone must contain 10 to 15 digits and may start with +.");
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email)).WithMessage("Invalid email format.");
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters.");
    }
}
