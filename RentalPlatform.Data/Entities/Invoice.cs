using System.Collections.Generic;

namespace RentalPlatform.Data.Entities;

public class Invoice
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string InvoiceStatus { get; set; } = null!;
    public decimal SubtotalAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime? IssuedAt { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Booking Booking { get; set; } = null!;
    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
