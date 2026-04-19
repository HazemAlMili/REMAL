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

public class CrmAssignmentService : ICrmAssignmentService
{
    private readonly IUnitOfWork _unitOfWork;

    public CrmAssignmentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CrmAssignment?> GetActiveForBookingAsync(
        Guid bookingId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBookingExistsAsync(bookingId, cancellationToken);

        return await _unitOfWork.CrmAssignments.Query()
            .Where(a => a.BookingId == bookingId && a.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CrmAssignment?> GetActiveForLeadAsync(
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        await EnsureLeadExistsAsync(leadId, cancellationToken);

        return await _unitOfWork.CrmAssignments.Query()
            .Where(a => a.CrmLeadId == leadId && a.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CrmAssignment> AssignBookingAsync(
        Guid bookingId,
        Guid assignedAdminUserId,
        CancellationToken cancellationToken = default)
    {
        var booking = await GetBookingOrThrowAsync(bookingId, cancellationToken);
        await ValidateAdminExistsAsync(assignedAdminUserId, cancellationToken);

        // If already the current active assignee, return existing assignment without duplicate
        var currentActive = await _unitOfWork.CrmAssignments.Query()
            .Where(a => a.BookingId == bookingId && a.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentActive != null && currentActive.AssignedAdminUserId == assignedAdminUserId)
            return currentActive;

        // Deactivate any currently active assignments for this booking
        await DeactivateBookingAssignmentsAsync(bookingId, cancellationToken);

        // Create new active assignment
        var assignment = new CrmAssignment
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            CrmLeadId = null,
            AssignedAdminUserId = assignedAdminUserId,
            IsActive = true,
            AssignedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.CrmAssignments.AddAsync(assignment, cancellationToken);

        // Synchronize parent snapshot field
        booking.AssignedAdminUserId = assignedAdminUserId;
        booking.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Bookings.Update(booking);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return assignment;
    }

    public async Task<CrmAssignment> AssignLeadAsync(
        Guid leadId,
        Guid assignedAdminUserId,
        CancellationToken cancellationToken = default)
    {
        var lead = await GetLeadOrThrowAsync(leadId, cancellationToken);
        await ValidateAdminExistsAsync(assignedAdminUserId, cancellationToken);

        // If already the current active assignee, return existing assignment without duplicate
        var currentActive = await _unitOfWork.CrmAssignments.Query()
            .Where(a => a.CrmLeadId == leadId && a.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentActive != null && currentActive.AssignedAdminUserId == assignedAdminUserId)
            return currentActive;

        // Deactivate any currently active assignments for this lead
        await DeactivateLeadAssignmentsAsync(leadId, cancellationToken);

        // Create new active assignment
        var assignment = new CrmAssignment
        {
            Id = Guid.NewGuid(),
            BookingId = null,
            CrmLeadId = leadId,
            AssignedAdminUserId = assignedAdminUserId,
            IsActive = true,
            AssignedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.CrmAssignments.AddAsync(assignment, cancellationToken);

        // Synchronize parent snapshot field
        lead.AssignedAdminUserId = assignedAdminUserId;
        lead.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.CrmLeads.Update(lead);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return assignment;
    }

    public async Task ClearBookingAssignmentAsync(
        Guid bookingId,
        CancellationToken cancellationToken = default)
    {
        var booking = await GetBookingOrThrowAsync(bookingId, cancellationToken);

        // Deactivate any active assignments
        await DeactivateBookingAssignmentsAsync(bookingId, cancellationToken);

        // Clear parent snapshot field
        booking.AssignedAdminUserId = null;
        booking.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Bookings.Update(booking);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearLeadAssignmentAsync(
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        var lead = await GetLeadOrThrowAsync(leadId, cancellationToken);

        // Deactivate any active assignments
        await DeactivateLeadAssignmentsAsync(leadId, cancellationToken);

        // Clear parent snapshot field
        lead.AssignedAdminUserId = null;
        lead.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.CrmLeads.Update(lead);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // ---------------------------------------------------------------
    //  Private helpers
    // ---------------------------------------------------------------

    private async Task EnsureBookingExistsAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var exists = await _unitOfWork.Bookings.ExistsAsync(b => b.Id == bookingId, cancellationToken);
        if (!exists)
            throw new NotFoundException($"Booking with ID {bookingId} not found");
    }

    private async Task EnsureLeadExistsAsync(Guid leadId, CancellationToken cancellationToken)
    {
        var exists = await _unitOfWork.CrmLeads.ExistsAsync(l => l.Id == leadId, cancellationToken);
        if (!exists)
            throw new NotFoundException($"CRM lead with ID {leadId} not found");
    }

    private async Task<Booking> GetBookingOrThrowAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId, cancellationToken);
        if (booking == null)
            throw new NotFoundException($"Booking with ID {bookingId} not found");
        return booking;
    }

    private async Task<CrmLead> GetLeadOrThrowAsync(Guid leadId, CancellationToken cancellationToken)
    {
        var lead = await _unitOfWork.CrmLeads.GetByIdAsync(leadId, cancellationToken);
        if (lead == null)
            throw new NotFoundException($"CRM lead with ID {leadId} not found");
        return lead;
    }

    private async Task ValidateAdminExistsAsync(Guid adminUserId, CancellationToken cancellationToken)
    {
        var exists = await _unitOfWork.AdminUsers.ExistsAsync(
            a => a.Id == adminUserId && a.IsActive, cancellationToken);
        if (!exists)
            throw new NotFoundException($"Active admin user with ID {adminUserId} not found");
    }

    private async Task DeactivateBookingAssignmentsAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var activeAssignments = await _unitOfWork.CrmAssignments.Query()
            .Where(a => a.BookingId == bookingId && a.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var assignment in activeAssignments)
        {
            assignment.IsActive = false;
            assignment.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.CrmAssignments.Update(assignment);
        }
    }

    private async Task DeactivateLeadAssignmentsAsync(Guid leadId, CancellationToken cancellationToken)
    {
        var activeAssignments = await _unitOfWork.CrmAssignments.Query()
            .Where(a => a.CrmLeadId == leadId && a.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var assignment in activeAssignments)
        {
            assignment.IsActive = false;
            assignment.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.CrmAssignments.Update(assignment);
        }
    }
}
