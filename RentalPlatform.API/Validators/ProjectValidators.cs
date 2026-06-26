using FluentValidation;
using RentalPlatform.API.DTOs.Requests.Projects;

namespace RentalPlatform.API.Validators;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
    }
}

public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    public UpdateProjectRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
    }
}

public class UpdateProjectStatusRequestValidator : AbstractValidator<UpdateProjectStatusRequest>
{
    public UpdateProjectStatusRequestValidator()
    {
        RuleFor(x => x.IsActive).NotNull().WithMessage("IsActive status is required.");
    }
}
