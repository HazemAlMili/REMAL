using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Security;

namespace RentalPlatform.API.Validators;

public class CreateRoleTemplateRequestValidator : AbstractValidator<CreateRoleTemplateRequest>
{
    public CreateRoleTemplateRequestValidator()
    {
        RuleFor(request => request.Name)
            .NotEmpty().WithMessage("Role name is required.")
            .MaximumLength(100).WithMessage("Role name cannot exceed 100 characters.");
        RuleFor(request => request.PermissionKeys)
            .NotNull().WithMessage("Permission keys are required.");
        RuleForEach(request => request.PermissionKeys)
            .NotEmpty().WithMessage("Permission keys cannot be empty.")
            .MaximumLength(50).WithMessage("Permission keys cannot exceed 50 characters.");
    }
}

public class UpdateRoleTemplateRequestValidator : AbstractValidator<UpdateRoleTemplateRequest>
{
    public UpdateRoleTemplateRequestValidator()
    {
        RuleFor(request => request.Name)
            .NotEmpty().WithMessage("Role name is required.")
            .MaximumLength(100).WithMessage("Role name cannot exceed 100 characters.");
        RuleFor(request => request.PermissionKeys)
            .NotNull().WithMessage("Permission keys are required.");
        RuleForEach(request => request.PermissionKeys)
            .NotEmpty().WithMessage("Permission keys cannot be empty.")
            .MaximumLength(50).WithMessage("Permission keys cannot exceed 50 characters.");
    }
}

public class UpdateUserPermissionOverridesRequestValidator
    : AbstractValidator<UpdateUserPermissionOverridesRequest>
{
    public UpdateUserPermissionOverridesRequestValidator()
    {
        RuleFor(request => request.Grants).NotNull().WithMessage("Grants are required.");
        RuleFor(request => request.Denies).NotNull().WithMessage("Denies are required.");
        RuleForEach(request => request.Grants)
            .NotEmpty().MaximumLength(50);
        RuleForEach(request => request.Denies)
            .NotEmpty().MaximumLength(50);
    }
}
