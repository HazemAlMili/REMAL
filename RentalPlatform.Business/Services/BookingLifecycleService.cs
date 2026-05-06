using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class BookingLifecycleService : IBookingLifecycleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUnitAvailabilityService _availabilityService;
    private readonly IInvoiceService _invoiceService;

    public BookingLifecycleService(IUnitOfWork unitOfWork, IUnitAvailabilityService availabilityService, IInvoiceService invoiceService)
    {
        _unitOfWork = unitOfWork;
        _availabilityService = availabilityService;
        _invoiceService = invoiceService;
    }

    public async Task<Booking> ConfirmAsync(
        Guid bookingId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var booking = await GetBookingOrThrowAsync(bookingId, cancellationToken);
        await ValidateAdminExistsAsync(changedByAdminUserId, cancellationToken);

        // Allowed from: pending, inquiry
        if (booking.BookingStatus != "pending" && booking.BookingStatus != "inquiry")
            throw new ConflictException(
                $"Cannot confirm booking {bookingId}: current status '{booking.BookingStatus}' does not allow confirmation. Allowed from: pending, inquiry.");

        // --- Re-check unit is still active ---
        var unit = await _unitOfWork.Units.FirstOrDefaultAsync(
            u => u.Id == booking.UnitId && u.IsActive && u.DeletedAt == null, cancellationToken);
        if (unit == null)
            throw new ConflictException(
                $"Cannot confirm booking {bookingId}: unit {booking.UnitId} is no longer active or has been deleted.");

        // --- Re-check operational availability (checkInDate through checkOutDate - 1 day) ---
        var pricingStartDate = booking.CheckInDate;
        var pricingEndDate = booking.CheckOutDate.AddDays(-1);

        var availability = await _availabilityService.CheckOperationalAvailabilityAsync(
            booking.UnitId, pricingStartDate, pricingEndDate, cancellationToken);
        if (!availability.IsAvailable)
            throw new ConflictException(
                $"Cannot confirm booking {bookingId}: unit {booking.UnitId} is not operationally available for the requested dates: {availability.Reason}");

        // --- Re-check confirmed booking overlap excluding self ---
        await EnsureNoConfirmedOverlap(booking.UnitId, booking.CheckInDate, booking.CheckOutDate, bookingId, cancellationToken);

        // --- Transition ---
        var oldStatus = booking.BookingStatus;
        booking.BookingStatus = "confirmed";
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await AppendStatusHistoryAsync(booking.Id, oldStatus, "confirmed", changedByAdminUserId, notes, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Auto-generate invoice
        var invoiceNumber = $"INV-{booking.Id.ToString()[..8].ToUpper()}";
        var draftInvoice = await _invoiceService.CreateDraftFromBookingAsync(
            booking.Id, 
            invoiceNumber, 
            "Auto-generated on confirmation", 
            cancellationToken);

        await _invoiceService.IssueAsync(draftInvoice.Id, cancellationToken);

        return booking;
    }

    public async Task<Booking> CancelAsync(
        Guid bookingId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var booking = await GetBookingOrThrowAsync(bookingId, cancellationToken);
        await ValidateAdminExistsAsync(changedByAdminUserId, cancellationToken);

        // Allowed from: inquiry, pending, confirmed
        // Not allowed from: cancelled, completed
        if (booking.BookingStatus != "inquiry" &&
            booking.BookingStatus != "pending" &&
            booking.BookingStatus != "confirmed")
            throw new ConflictException(
                $"Cannot cancel booking {bookingId}: current status '{booking.BookingStatus}' does not allow cancellation. Allowed from: inquiry, pending, confirmed.");

        // --- Transition ---
        var oldStatus = booking.BookingStatus;
        booking.BookingStatus = "cancelled";
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await AppendStatusHistoryAsync(booking.Id, oldStatus, "cancelled", changedByAdminUserId, notes, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return booking;
    }

    public async Task<Booking> CompleteAsync(
        Guid bookingId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var booking = await GetBookingOrThrowAsync(bookingId, cancellationToken);
        await ValidateAdminExistsAsync(changedByAdminUserId, cancellationToken);

        // Allowed from: confirmed only
        if (booking.BookingStatus != "confirmed")
            throw new ConflictException(
                $"Cannot complete booking {bookingId}: current status '{booking.BookingStatus}' does not allow completion. Allowed from: confirmed.");

        // --- Transition ---
        var oldStatus = booking.BookingStatus;
        booking.BookingStatus = "completed";
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await AppendStatusHistoryAsync(booking.Id, oldStatus, "completed", changedByAdminUserId, notes, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return booking;
    }

    public async Task<Booking> CheckInAsync(
        Guid bookingId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var booking = await GetBookingOrThrowAsync(bookingId, cancellationToken);
        await ValidateAdminExistsAsync(changedByAdminUserId, cancellationToken);

        // We don't change the booking status since check_in is not a valid DB status for bookings
        // but we record it in the history
        await AppendStatusHistoryAsync(booking.Id, booking.BookingStatus, "check_in", changedByAdminUserId, notes, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return booking;
    }

    public async Task<Booking> LeftEarlyAsync(
        Guid bookingId,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var booking = await GetBookingOrThrowAsync(bookingId, cancellationToken);
        await ValidateAdminExistsAsync(changedByAdminUserId, cancellationToken);

        // Transition to completed when they leave early
        var oldStatus = booking.BookingStatus;
        booking.BookingStatus = "completed";
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await AppendStatusHistoryAsync(booking.Id, oldStatus, "left_early", changedByAdminUserId, notes, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return booking;
    }

    // ---------------------------------------------------------------
    //  Private helpers
    // ---------------------------------------------------------------

    private async Task<Booking> GetBookingOrThrowAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId, cancellationToken);
        if (booking == null)
            throw new NotFoundException($"Booking with ID {bookingId} not found");
        return booking;
    }

    private async Task ValidateAdminExistsAsync(Guid adminUserId, CancellationToken cancellationToken)
    {
        var exists = await _unitOfWork.AdminUsers.ExistsAsync(
            a => a.Id == adminUserId && a.IsActive, cancellationToken);
        if (!exists)
            throw new NotFoundException($"Active admin user with ID {adminUserId} not found");
    }

    private async Task AppendStatusHistoryAsync(
        Guid bookingId,
        string oldStatus,
        string newStatus,
        Guid changedByAdminUserId,
        string? notes,
        CancellationToken cancellationToken)
    {
        var history = new BookingStatusHistory
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedByAdminUserId = changedByAdminUserId,
            Notes = notes?.Trim(),
            ChangedAt = DateTime.UtcNow
        };

        await _unitOfWork.BookingStatusHistories.AddAsync(history, cancellationToken);
    }

    /// <summary>
    /// Ensures no confirmed booking on the same unit overlaps the requested date range.
    /// Two stays overlap when: newCheckIn &lt; existingCheckOut AND newCheckOut &gt; existingCheckIn.
    /// </summary>
    private async Task EnsureNoConfirmedOverlap(
        Guid unitId,
        DateOnly checkInDate,
        DateOnly checkOutDate,
        Guid excludeBookingId,
        CancellationToken cancellationToken)
    {
        var hasOverlap = await _unitOfWork.Bookings.Query()
            .Where(b => b.UnitId == unitId)
            .Where(b => b.BookingStatus == "confirmed")
            .Where(b => b.Id != excludeBookingId)
            .Where(b => checkInDate < b.CheckOutDate && checkOutDate > b.CheckInDate)
            .AnyAsync(cancellationToken);

        if (hasOverlap)
            throw new ConflictException(
                $"Cannot confirm: the requested dates overlap with an existing confirmed booking on unit {unitId}");
    }
}
