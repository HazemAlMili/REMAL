using FluentValidation;
using RentalPlatform.API.DTOs.Requests.CrmAssignments;

namespace RentalPlatform.API.Validators;

public class AssignBookingRequestValidator : AbstractValidator<AssignBookingRequest>
{
    public AssignBookingRequestValidator()
    {
        RuleFor(x => x.AssignedAdminUserId).NotEmpty();
    }
}

public class AssignLeadRequestValidator : AbstractValidator<AssignLeadRequest>
{
    public AssignLeadRequestValidator()
    {
        RuleFor(x => x.AssignedAdminUserId).NotEmpty();
    }
}
