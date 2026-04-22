namespace RentalPlatform.API.DTOs.Requests.NotificationInbox;

public record GetInboxRequest(
    bool UnreadOnly = false,
    int Page = 1,
    int PageSize = 20
);
