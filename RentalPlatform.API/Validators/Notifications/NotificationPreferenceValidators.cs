using FluentValidation;
using RentalPlatform.API.DTOs.Requests.NotificationPreferences;

namespace RentalPlatform.API.Validators.Notifications;

public class UpsertNotificationPreferenceRequestValidator : AbstractValidator<UpsertNotificationPreferenceRequest>
{
    private static readonly string[] AllowedChannels = { "in_app", "email", "sms", "whatsapp" };

    public UpsertNotificationPreferenceRequestValidator()
    {
        RuleFor(x => x.Channel)
            .NotEmpty().WithMessage("Channel is required.")
            .Must(v => AllowedChannels.Contains(v?.Trim().ToLower()))
            .WithMessage("Channel must be one of: in_app, email, sms, whatsapp.");

        RuleFor(x => x.PreferenceKey)
            .NotEmpty().WithMessage("PreferenceKey is required.")
            .Must(v => !string.IsNullOrWhiteSpace(v)).WithMessage("PreferenceKey cannot be whitespace.");
    }
}
