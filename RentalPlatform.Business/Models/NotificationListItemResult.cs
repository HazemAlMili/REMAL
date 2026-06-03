using System;

namespace RentalPlatform.Business.Models;

public record NotificationListItemResult
{
    public Guid NotificationId { get; init; }
    public string Channel { get; init; } = null!;
    public string NotificationStatus { get; init; } = null!;
    public string? Subject { get; init; }
    public string Body { get; init; } = null!;
    public DateTime CreatedAt { get; init; }
    public DateTime? SentAt { get; init; }
    public DateTime? ReadAt { get; init; }
    /// <summary>
    /// Application-layer derived sender label. Resolved from the AdminUser navigation
    /// property if present, otherwise falls back to "إشعار تلقائي من المنصة".
    /// No schema change required — populated entirely in the service layer.
    /// </summary>
    public string SenderLabel { get; init; } = "إشعار تلقائي من المنصة";
}
