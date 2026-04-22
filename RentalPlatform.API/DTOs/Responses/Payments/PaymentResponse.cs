using System;

namespace RentalPlatform.API.DTOs.Responses.Payments;

public record PaymentResponse
{
    public Guid Id { get; init; }
    public Guid BookingId { get; init; }
    public Guid? InvoiceId { get; init; }
    public string PaymentStatus { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? Notes { get; init; }
    public DateTime? PaidAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
