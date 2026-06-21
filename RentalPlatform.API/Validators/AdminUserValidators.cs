using FluentValidation;
using RentalPlatform.API.DTOs.Requests.AdminUsers;

namespace RentalPlatform.API.Validators;

public class CreateAdminUserRequestValidator : AbstractValidator<CreateAdminUserRequest>
{
    public CreateAdminUserRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Valid email is required.");
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.");
        RuleFor(x => x.RoleTemplateId).NotEmpty().WithMessage("Role template is required.");
    }
}

public class UpdateAdminUserRoleRequestValidator : AbstractValidator<UpdateAdminUserRoleRequest>
{
    public UpdateAdminUserRoleRequestValidator()
    {
        RuleFor(x => x.RoleTemplateId).NotEmpty().WithMessage("Role template is required.");
    }
}

public class UpdateAdminUserStatusRequestValidator : AbstractValidator<UpdateAdminUserStatusRequest>
{
    public UpdateAdminUserStatusRequestValidator()
    {
        RuleFor(x => x.IsActive).NotNull().WithMessage("IsActive status is required.");
    }
}
