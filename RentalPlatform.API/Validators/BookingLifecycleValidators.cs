using FluentValidation;
using RentalPlatform.API.DTOs.Requests.BookingLifecycle;

namespace RentalPlatform.API.Validators;

public class ConfirmBookingRequestValidator : AbstractValidator<ConfirmBookingRequest>
{
    public ConfirmBookingRequestValidator()
    {
        // Notes are optional
    }
}

public class CancelBookingRequestValidator : AbstractValidator<CancelBookingRequest>
{
    public CancelBookingRequestValidator()
    {
        // Notes are optional
    }
}

public class CompleteBookingRequestValidator : AbstractValidator<CompleteBookingRequest>
{
    public CompleteBookingRequestValidator()
    {
        // Notes are optional
    }
}
