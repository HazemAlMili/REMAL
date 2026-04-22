using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Notifications;

namespace RentalPlatform.API.Validators.Notifications;

public class CreateAdminNotificationRequestValidator : AbstractValidator<CreateAdminNotificationRequest>
{
    private static readonly string[] AllowedChannels = { "in_app", "email", "sms", "whatsapp" };

    public CreateAdminNotificationRequestValidator()
    {
        RuleFor(x => x.TemplateCode)
            .NotEmpty().WithMessage("TemplateCode is required.")
            .Must(v => !string.IsNullOrWhiteSpace(v)).WithMessage("TemplateCode cannot be whitespace.");

        RuleFor(x => x.Channel)
            .NotEmpty().WithMessage("Channel is required.")
            .Must(v => AllowedChannels.Contains(v?.Trim().ToLower()))
            .WithMessage("Channel must be one of: in_app, email, sms, whatsapp.");
    }
}

public class CreateClientNotificationRequestValidator : AbstractValidator<CreateClientNotificationRequest>
{
    private static readonly string[] AllowedChannels = { "in_app", "email", "sms", "whatsapp" };

    public CreateClientNotificationRequestValidator()
    {
        RuleFor(x => x.TemplateCode)
            .NotEmpty().WithMessage("TemplateCode is required.")
            .Must(v => !string.IsNullOrWhiteSpace(v)).WithMessage("TemplateCode cannot be whitespace.");

        RuleFor(x => x.Channel)
            .NotEmpty().WithMessage("Channel is required.")
            .Must(v => AllowedChannels.Contains(v?.Trim().ToLower()))
            .WithMessage("Channel must be one of: in_app, email, sms, whatsapp.");
    }
}

public class CreateOwnerNotificationRequestValidator : AbstractValidator<CreateOwnerNotificationRequest>
{
    private static readonly string[] AllowedChannels = { "in_app", "email", "sms", "whatsapp" };

    public CreateOwnerNotificationRequestValidator()
    {
        RuleFor(x => x.TemplateCode)
            .NotEmpty().WithMessage("TemplateCode is required.")
            .Must(v => !string.IsNullOrWhiteSpace(v)).WithMessage("TemplateCode cannot be whitespace.");

        RuleFor(x => x.Channel)
            .NotEmpty().WithMessage("Channel is required.")
            .Must(v => AllowedChannels.Contains(v?.Trim().ToLower()))
            .WithMessage("Channel must be one of: in_app, email, sms, whatsapp.");
    }
}

public class GetNotificationsRequestValidator : AbstractValidator<GetNotificationsRequest>
{
    private static readonly string[] AllowedChannels = { "in_app", "email", "sms", "whatsapp" };

    public GetNotificationsRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1).WithMessage("Page must be >= 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("PageSize must be >= 1.")
            .LessThanOrEqualTo(100).WithMessage("PageSize must be <= 100.");

        When(x => !string.IsNullOrWhiteSpace(x.Channel), () =>
        {
            RuleFor(x => x.Channel)
                .Must(v => AllowedChannels.Contains(v!.Trim().ToLower()))
                .WithMessage("Channel must be one of: in_app, email, sms, whatsapp.");
        });
    }
}
