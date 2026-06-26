namespace RentalPlatform.API.DTOs.Requests.Projects;

public record UpdateProjectRequest(
    string Name,
    string? Description,
    bool IsActive
);
