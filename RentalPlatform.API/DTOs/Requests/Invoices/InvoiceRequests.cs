using System;

namespace RentalPlatform.API.DTOs.Requests.Invoices;

public record CreateInvoiceDraftRequest
{
    public Guid BookingId { get; init; }
    public string? InvoiceNumber { get; init; }
    public string? Notes { get; init; }
}

public record AddInvoiceManualAdjustmentRequest
{
    public string Description { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitAmount { get; init; }
}

public record CancelInvoiceRequest
{
    public string? Notes { get; init; }
}

public record ReissueInvoiceRequest
{
    public string? NewInvoiceNumber { get; init; }
    public string? Notes { get; init; }
}
