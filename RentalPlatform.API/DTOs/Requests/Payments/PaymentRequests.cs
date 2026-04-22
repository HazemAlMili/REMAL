using System;

namespace RentalPlatform.API.DTOs.Requests.Payments;

public record CreatePaymentRequest
{
    public Guid BookingId { get; init; }
    public Guid? InvoiceId { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? Notes { get; init; }
}

public record MarkPaymentPaidRequest
{
    public string? ReferenceNumber { get; init; }
    public string? Notes { get; init; }
}

public record MarkPaymentFailedRequest
{
    public string? Notes { get; init; }
}

public record CancelPaymentRequest
{
    public string? Notes { get; init; }
}
