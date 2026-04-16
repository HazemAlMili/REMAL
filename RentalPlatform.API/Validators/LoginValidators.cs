using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Auth;

namespace RentalPlatform.API.Validators;

public class ClientLoginRequestValidator : AbstractValidator<ClientLoginRequest>
{
    public ClientLoginRequestValidator()
    {
        RuleFor(x => x.Phone).NotEmpty().WithMessage("Phone is required.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}

public class AdminLoginRequestValidator : AbstractValidator<AdminLoginRequest>
{
    public AdminLoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Valid email is required.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}

public class OwnerLoginRequestValidator : AbstractValidator<OwnerLoginRequest>
{
    public OwnerLoginRequestValidator()
    {
        RuleFor(x => x.Phone).NotEmpty().WithMessage("Phone is required.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}
