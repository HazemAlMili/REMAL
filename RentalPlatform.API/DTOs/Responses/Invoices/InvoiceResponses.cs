using System;
using System.Collections.Generic;

namespace RentalPlatform.API.DTOs.Responses.Invoices;

public record InvoiceItemResponse
{
    public Guid Id { get; init; }
    public Guid InvoiceId { get; init; }
    public string LineType { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitAmount { get; init; }
    public decimal LineTotal { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record InvoiceResponse
{
    public Guid Id { get; init; }
    public Guid BookingId { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public string InvoiceStatus { get; init; } = string.Empty;
    public decimal SubtotalAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public DateTime? IssuedAt { get; init; }
    public DateOnly? DueDate { get; init; }
    public string? Notes { get; init; }
    public IReadOnlyList<InvoiceItemResponse> Items { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
