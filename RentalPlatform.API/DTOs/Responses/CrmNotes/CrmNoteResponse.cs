using System;

namespace RentalPlatform.API.DTOs.Responses.CrmNotes;

public record CrmNoteResponse
{
    public Guid Id { get; init; }
    public Guid? BookingId { get; init; }
    public Guid? CrmLeadId { get; init; }
    public Guid CreatedByAdminUserId { get; init; }
    public string NoteText { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
