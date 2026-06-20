using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Clients;

namespace RentalPlatform.API.Validators;

public class CreateClientRequestValidator : AbstractValidator<CreateClientRequest>
{
    public CreateClientRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Phone)
            .NotEmpty()
            .Matches(@"^\+?\d{10,15}$")
            .WithMessage("Phone must contain 10 to 15 digits and may start with +.");
        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Invalid email format.");
    }
}

public class ResetClientPasswordRequestValidator : AbstractValidator<ResetClientPasswordRequest>
{
    public ResetClientPasswordRequestValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("NewPassword must be at least 8 characters.");
    }
}
