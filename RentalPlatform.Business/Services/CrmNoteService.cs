using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class CrmNoteService : ICrmNoteService
{
    private readonly IUnitOfWork _unitOfWork;

    public CrmNoteService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CrmNote>> GetByBookingIdAsync(
        Guid bookingId,
        CancellationToken cancellationToken = default)
    {
        var bookingExists = await _unitOfWork.Bookings.ExistsAsync(
            b => b.Id == bookingId, cancellationToken);
        if (!bookingExists)
            throw new NotFoundException($"Booking with ID {bookingId} not found");

        return await _unitOfWork.CrmNotes.Query()
            .Where(n => n.BookingId == bookingId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CrmNote>> GetByLeadIdAsync(
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        var leadExists = await _unitOfWork.CrmLeads.ExistsAsync(
            l => l.Id == leadId, cancellationToken);
        if (!leadExists)
            throw new NotFoundException($"CRM lead with ID {leadId} not found");

        return await _unitOfWork.CrmNotes.Query()
            .Where(n => n.CrmLeadId == leadId)
            .ToListAsync(cancellationToken);
    }

    public async Task<CrmNote> AddToBookingAsync(
        Guid bookingId,
        Guid? createdByAdminUserId,
        string noteText,
        CancellationToken cancellationToken = default)
    {
        ValidateNoteText(noteText);

        var bookingExists = await _unitOfWork.Bookings.ExistsAsync(
            b => b.Id == bookingId, cancellationToken);
        if (!bookingExists)
            throw new NotFoundException($"Booking with ID {bookingId} not found");

        await ValidateOptionalAdminAsync(createdByAdminUserId, cancellationToken);

        var note = new CrmNote
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            CrmLeadId = null,
            CreatedByAdminUserId = createdByAdminUserId,
            NoteText = noteText.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.CrmNotes.AddAsync(note, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return note;
    }

    public async Task<CrmNote> AddToLeadAsync(
        Guid leadId,
        Guid? createdByAdminUserId,
        string noteText,
        CancellationToken cancellationToken = default)
    {
        ValidateNoteText(noteText);

        var leadExists = await _unitOfWork.CrmLeads.ExistsAsync(
            l => l.Id == leadId, cancellationToken);
        if (!leadExists)
            throw new NotFoundException($"CRM lead with ID {leadId} not found");

        await ValidateOptionalAdminAsync(createdByAdminUserId, cancellationToken);

        var note = new CrmNote
        {
            Id = Guid.NewGuid(),
            BookingId = null,
            CrmLeadId = leadId,
            CreatedByAdminUserId = createdByAdminUserId,
            NoteText = noteText.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.CrmNotes.AddAsync(note, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return note;
    }

    public async Task<CrmNote> UpdateAsync(
        Guid id,
        string noteText,
        CancellationToken cancellationToken = default)
    {
        ValidateNoteText(noteText);

        var note = await _unitOfWork.CrmNotes.GetByIdAsync(id, cancellationToken);
        if (note == null)
            throw new NotFoundException($"CRM note with ID {id} not found");

        note.NoteText = noteText.Trim();
        note.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.CrmNotes.Update(note);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return note;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var note = await _unitOfWork.CrmNotes.GetByIdAsync(id, cancellationToken);
        if (note == null)
            throw new NotFoundException($"CRM note with ID {id} not found");

        _unitOfWork.CrmNotes.Delete(note);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // ---------------------------------------------------------------
    //  Private helpers
    // ---------------------------------------------------------------

    private static void ValidateNoteText(string noteText)
    {
        if (string.IsNullOrWhiteSpace(noteText))
            throw new BusinessValidationException("Note text is required");
    }

    private async Task ValidateOptionalAdminAsync(
        Guid? adminUserId,
        CancellationToken cancellationToken)
    {
        if (!adminUserId.HasValue)
            return;

        var exists = await _unitOfWork.AdminUsers.ExistsAsync(
            a => a.Id == adminUserId.Value && a.IsActive, cancellationToken);
        if (!exists)
            throw new NotFoundException($"Active admin user with ID {adminUserId.Value} not found");
    }
}
