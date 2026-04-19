using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Bookings;
using System;
using System.Linq;

namespace RentalPlatform.API.Validators;

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    private static readonly string[] AllowedSources = { "direct", "admin", "phone", "whatsapp", "website" };

    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.ClientId).NotEmpty();
        RuleFor(x => x.UnitId).NotEmpty();
        
        RuleFor(x => x.CheckInDate)
            .NotEmpty();

        RuleFor(x => x.CheckOutDate)
            .NotEmpty()
            .GreaterThan(x => x.CheckInDate)
            .WithMessage("CheckOutDate must be after CheckInDate.");

        RuleFor(x => x.GuestCount)
            .GreaterThan(0)
            .WithMessage("GuestCount must be greater than 0.");

        RuleFor(x => x.Source)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x) && AllowedSources.Contains(x.Trim().ToLower()))
            .WithMessage($"Source must be one of: {string.Join(", ", AllowedSources)}.");
    }
}

public class UpdatePendingBookingRequestValidator : AbstractValidator<UpdatePendingBookingRequest>
{
    private static readonly string[] AllowedSources = { "direct", "admin", "phone", "whatsapp", "website" };

    public UpdatePendingBookingRequestValidator()
    {
        RuleFor(x => x.CheckInDate)
            .NotEmpty();

        RuleFor(x => x.CheckOutDate)
            .NotEmpty()
            .GreaterThan(x => x.CheckInDate)
            .WithMessage("CheckOutDate must be after CheckInDate.");

        RuleFor(x => x.GuestCount)
            .GreaterThan(0)
            .WithMessage("GuestCount must be greater than 0.");

        RuleFor(x => x.Source)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x) && AllowedSources.Contains(x.Trim().ToLower()))
            .WithMessage($"Source must be one of: {string.Join(", ", AllowedSources)}.");
    }
}
