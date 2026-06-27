namespace RentalPlatform.API.DTOs.Requests.Units;

public record UpdateUnitPortfolioVisibilityRequest
{
    public bool IsVisibleInPortfolio { get; init; }
}
