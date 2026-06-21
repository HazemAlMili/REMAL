using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.Authorization;
using RentalPlatform.API.DTOs.Responses.AdminUsers;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/internal/admin-directory")]
[Authorize(Policy = PermissionCatalog.AdminAuthenticated)]
public class AdminDirectoryController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminDirectoryController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AdminDirectoryResponse>>>> GetAll(
        CancellationToken cancellationToken)
    {
        var admins = await _adminUserService.GetAllAsync(
            includeInactive: true,
            cancellationToken);
        var response = admins
            .OrderBy(admin => admin.Name)
            .Select(admin => new AdminDirectoryResponse(
                admin.Id,
                admin.Name,
                admin.Email,
                admin.RoleTemplate?.Name ?? admin.Role?.ToString() ?? "Custom",
                admin.IsActive))
            .ToArray();

        return Ok(ApiResponse<IReadOnlyList<AdminDirectoryResponse>>.CreateSuccess(response));
    }
}
