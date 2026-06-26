namespace RentalPlatform.API.DTOs.Requests.Projects;

public record CreateProjectRequest(
    string Name,
    string? Description,
    bool IsActive
);
