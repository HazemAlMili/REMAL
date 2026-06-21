namespace RentalPlatform.API.DTOs.Responses.Notifications;

public record NotificationRecipientResponse(
    Guid Id,
    string DisplayName,
    string Identifier,
    string SubjectType);
