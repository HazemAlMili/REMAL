using FluentValidation;
using RentalPlatform.API.DTOs.Requests.CrmNotes;

namespace RentalPlatform.API.Validators;

public class AddBookingNoteRequestValidator : AbstractValidator<AddBookingNoteRequest>
{
    public AddBookingNoteRequestValidator()
    {
        RuleFor(x => x.NoteText)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x?.Trim()))
            .WithMessage("NoteText is required.");
    }
}

public class AddLeadNoteRequestValidator : AbstractValidator<AddLeadNoteRequest>
{
    public AddLeadNoteRequestValidator()
    {
        RuleFor(x => x.NoteText)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x?.Trim()))
            .WithMessage("NoteText is required.");
    }
}

public class UpdateCrmNoteRequestValidator : AbstractValidator<UpdateCrmNoteRequest>
{
    public UpdateCrmNoteRequestValidator()
    {
        RuleFor(x => x.NoteText)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x?.Trim()))
            .WithMessage("NoteText is required.");
    }
}
