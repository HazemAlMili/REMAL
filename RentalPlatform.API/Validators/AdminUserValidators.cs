using FluentValidation;
using RentalPlatform.API.DTOs.Requests.AdminUsers;

namespace RentalPlatform.API.Validators;

public class CreateAdminUserRequestValidator : AbstractValidator<CreateAdminUserRequest>
{
    public CreateAdminUserRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Valid email is required.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
        RuleFor(x => x.Role).IsInEnum().WithMessage("Invalid role specified.");
    }
}

public class UpdateAdminUserRoleRequestValidator : AbstractValidator<UpdateAdminUserRoleRequest>
{
    public UpdateAdminUserRoleRequestValidator()
    {
        RuleFor(x => x.Role).IsInEnum().WithMessage("Invalid role specified.");
    }
}

public class UpdateAdminUserStatusRequestValidator : AbstractValidator<UpdateAdminUserStatusRequest>
{
    public UpdateAdminUserStatusRequestValidator()
    {
        RuleFor(x => x.IsActive).NotNull().WithMessage("IsActive status is required.");
    }
}
