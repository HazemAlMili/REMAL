using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Payments;

namespace RentalPlatform.API.Validators;

public class CreatePaymentRequestValidator : AbstractValidator<CreatePaymentRequest>
{
    private static readonly string[] AllowedMethods = { "cash", "bank_transfer", "card", "wallet" };

    public CreatePaymentRequestValidator()
    {
        RuleFor(x => x.BookingId)
            .NotEmpty();

        RuleFor(x => x.PaymentMethod)
            .NotEmpty()
            .Must(m => !string.IsNullOrWhiteSpace(m) && AllowedMethods.Contains(m.Trim().ToLower()))
            .WithMessage($"PaymentMethod must be one of: {string.Join(", ", AllowedMethods)}.");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than 0.");
    }
}

public class MarkPaymentPaidRequestValidator : AbstractValidator<MarkPaymentPaidRequest>
{
    public MarkPaymentPaidRequestValidator() { }
}

public class MarkPaymentFailedRequestValidator : AbstractValidator<MarkPaymentFailedRequest>
{
    public MarkPaymentFailedRequestValidator() { }
}

public class CancelPaymentRequestValidator : AbstractValidator<CancelPaymentRequest>
{
    public CancelPaymentRequestValidator() { }
}
