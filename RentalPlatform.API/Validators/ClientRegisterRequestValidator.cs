using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Auth;

namespace RentalPlatform.API.Validators;

public class ClientRegisterRequestValidator : AbstractValidator<ClientRegisterRequest>
{
    public ClientRegisterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Phone).NotEmpty().WithMessage("Phone is required.");
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email)).WithMessage("Invalid email format.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}
