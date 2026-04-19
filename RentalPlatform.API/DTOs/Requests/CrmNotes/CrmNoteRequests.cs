using System;

namespace RentalPlatform.API.DTOs.Requests.CrmNotes;

public record AddBookingNoteRequest
{
    public string NoteText { get; init; } = string.Empty;
}

public record AddLeadNoteRequest
{
    public string NoteText { get; init; } = string.Empty;
}

public record UpdateCrmNoteRequest
{
    public string NoteText { get; init; } = string.Empty;
}
