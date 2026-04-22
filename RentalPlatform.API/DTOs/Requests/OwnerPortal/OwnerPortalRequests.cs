using System;

namespace RentalPlatform.API.DTOs.Requests.OwnerPortal;

public record GetOwnerPortalUnitsRequest
{
    public bool? IsActive { get; init; }
    public Guid? AreaId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public record GetOwnerPortalBookingsRequest
{
    public string? BookingStatus { get; init; }
    public DateOnly? CheckInFrom { get; init; }
    public DateOnly? CheckInTo { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public record GetOwnerPortalFinanceRequest
{
    public string? InvoiceStatus { get; init; }
    public string? PayoutStatus { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
