
namespace RentalPlatform.Data.Entities;

public class OwnerPayout
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid OwnerId { get; set; }
    public string PayoutStatus { get; set; } = null!;
    public decimal GrossBookingAmount { get; set; }
    public decimal CommissionRate { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal PayoutAmount { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Booking Booking { get; set; } = null!;
    public Owner Owner { get; set; } = null!;
}
