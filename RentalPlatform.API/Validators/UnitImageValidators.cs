using FluentValidation;
using RentalPlatform.API.DTOs.Requests.UnitImages;
using System.Linq;

namespace RentalPlatform.API.Validators;

public class AddUnitImageRequestValidator : AbstractValidator<AddUnitImageRequest>
{
    public AddUnitImageRequestValidator()
    {
        RuleFor(x => x.FileKey)
            .NotEmpty()
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("FileKey is required and cannot be empty or whitespace.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("DisplayOrder must be greater than or equal to 0.");
    }
}

public class ReorderUnitImagesRequestValidator : AbstractValidator<ReorderUnitImagesRequest>
{
    public ReorderUnitImagesRequestValidator()
    {
        RuleFor(x => x.Items)
            .Must(items => items != null && items.Select(i => i.ImageId).Distinct().Count() == items.Count)
            .WithMessage("Reorder request must not contain duplicate ImageIds.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.DisplayOrder)
                .GreaterThanOrEqualTo(0)
                .WithMessage("DisplayOrder must be greater than or equal to 0.");
        });
    }
}
