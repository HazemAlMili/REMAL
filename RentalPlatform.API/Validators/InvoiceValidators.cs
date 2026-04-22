using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Invoices;

namespace RentalPlatform.API.Validators;

public class CreateInvoiceDraftRequestValidator : AbstractValidator<CreateInvoiceDraftRequest>
{
    public CreateInvoiceDraftRequestValidator()
    {
        RuleFor(x => x.BookingId)
            .NotEmpty();

        RuleFor(x => x.InvoiceNumber)
            .NotEmpty()
            .Must(n => !string.IsNullOrWhiteSpace(n))
            .WithMessage("InvoiceNumber is required and cannot be blank.");
    }
}

public class AddInvoiceManualAdjustmentRequestValidator : AbstractValidator<AddInvoiceManualAdjustmentRequest>
{
    public AddInvoiceManualAdjustmentRequestValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty()
            .Must(d => !string.IsNullOrWhiteSpace(d))
            .WithMessage("Description is required and cannot be blank.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.");

        RuleFor(x => x.UnitAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("UnitAmount must be 0 or greater.");
    }
}

public class CancelInvoiceRequestValidator : AbstractValidator<CancelInvoiceRequest>
{
    public CancelInvoiceRequestValidator() { }
}
