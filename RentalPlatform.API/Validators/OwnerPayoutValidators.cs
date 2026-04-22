using FluentValidation;
using RentalPlatform.API.DTOs.Requests.OwnerPayouts;

namespace RentalPlatform.API.Validators;

public class CreateOrUpdateOwnerPayoutRequestValidator : AbstractValidator<CreateOrUpdateOwnerPayoutRequest>
{
    public CreateOrUpdateOwnerPayoutRequestValidator()
    {
        RuleFor(x => x.BookingId)
            .NotEmpty();

        RuleFor(x => x.CommissionRate)
            .GreaterThanOrEqualTo(0)
            .WithMessage("CommissionRate must be 0 or greater.")
            .LessThanOrEqualTo(100)
            .WithMessage("CommissionRate must not exceed 100.");
    }
}

public class SetOwnerPayoutScheduledRequestValidator : AbstractValidator<SetOwnerPayoutScheduledRequest>
{
    public SetOwnerPayoutScheduledRequestValidator() { }
}

public class MarkOwnerPayoutPaidRequestValidator : AbstractValidator<MarkOwnerPayoutPaidRequest>
{
    public MarkOwnerPayoutPaidRequestValidator() { }
}

public class CancelOwnerPayoutRequestValidator : AbstractValidator<CancelOwnerPayoutRequest>
{
    public CancelOwnerPayoutRequestValidator() { }
}
