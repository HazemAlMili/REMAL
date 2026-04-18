using System;

namespace RentalPlatform.Data.Entities;

public class BookingStatusHistory
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = null!;
    public Guid? ChangedByAdminUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime ChangedAt { get; set; }

    // Navigations
    public Booking Booking { get; set; } = null!;
    public AdminUser? ChangedByAdminUser { get; set; }
}
