using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.Authorization;
using RentalPlatform.API.DTOs.Requests.Security;
using RentalPlatform.API.DTOs.Responses.Security;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using System.Security.Claims;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/internal/security")]
[Authorize(Policy = PermissionKeys.SettingsAdmin)]
public class SecurityController : ControllerBase
{
    private readonly IRbacAdminService _rbacAdminService;

    public SecurityController(IRbacAdminService rbacAdminService)
    {
        _rbacAdminService = rbacAdminService;
    }

    [HttpGet("permissions")]
    public ActionResult<ApiResponse<IReadOnlyCollection<PermissionGroupResponse>>> GetPermissions()
    {
        var groups = PermissionKeys.Descriptors
            .GroupBy(descriptor => descriptor.Module)
            .Select(group => new PermissionGroupResponse(
                group.Key,
                group.OrderBy(descriptor => descriptor.Label).ToArray()))
            .ToArray();

        return Ok(ApiResponse<IReadOnlyCollection<PermissionGroupResponse>>.CreateSuccess(groups));
    }

    [HttpGet("roles")]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<RoleTemplateResponse>>>> GetRoles(
        CancellationToken cancellationToken)
    {
        var roles = await _rbacAdminService.GetRoleTemplatesAsync(cancellationToken);
        var response = roles.Select(RoleTemplateResponse.FromModel).ToArray();
        return Ok(ApiResponse<IReadOnlyCollection<RoleTemplateResponse>>.CreateSuccess(response));
    }

    [HttpPost("roles")]
    public async Task<ActionResult<ApiResponse<RoleTemplateResponse>>> CreateRole(
        CreateRoleTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var role = await _rbacAdminService.CreateRoleTemplateAsync(
            request.Name,
            request.Description,
            request.PermissionKeys,
            cancellationToken);
        return Ok(ApiResponse<RoleTemplateResponse>.CreateSuccess(
            RoleTemplateResponse.FromModel(role),
            "Role template created."));
    }

    [HttpPut("roles/{id:guid}")]
    public async Task<ActionResult<ApiResponse<RoleTemplateResponse>>> UpdateRole(
        Guid id,
        UpdateRoleTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var callerId = GetCallerId();
        if (!callerId.HasValue)
            return Unauthorized(ApiResponse.CreateFailure("Could not resolve the caller's identity."));

        var role = await _rbacAdminService.UpdateRoleTemplateAsync(
            callerId.Value,
            id,
            request.Name,
            request.Description,
            request.PermissionKeys,
            cancellationToken);
        return Ok(ApiResponse<RoleTemplateResponse>.CreateSuccess(
            RoleTemplateResponse.FromModel(role),
            "Role template updated."));
    }

    [HttpDelete("roles/{id:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteRole(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _rbacAdminService.DeleteRoleTemplateAsync(id, cancellationToken);
        return Ok(ApiResponse.CreateSuccess(message: "Role template deleted."));
    }

    [HttpGet("users/{id:guid}/overrides")]
    public async Task<ActionResult<ApiResponse<UserPermissionOverridesResponse>>> GetUserOverrides(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _rbacAdminService.GetUserOverridesAsync(id, cancellationToken);
        return Ok(ApiResponse<UserPermissionOverridesResponse>.CreateSuccess(
            UserPermissionOverridesResponse.FromModel(result)));
    }

    [HttpPut("users/{id:guid}/overrides")]
    public async Task<ActionResult<ApiResponse<UserPermissionOverridesResponse>>> UpdateUserOverrides(
        Guid id,
        UpdateUserPermissionOverridesRequest request,
        CancellationToken cancellationToken)
    {
        var callerId = GetCallerId();
        if (!callerId.HasValue)
            return Unauthorized(ApiResponse.CreateFailure("Could not resolve the caller's identity."));

        var result = await _rbacAdminService.ReplaceUserOverridesAsync(
            callerId.Value,
            id,
            request.Grants,
            request.Denies,
            cancellationToken);
        return Ok(ApiResponse<UserPermissionOverridesResponse>.CreateSuccess(
            UserPermissionOverridesResponse.FromModel(result),
            "Permission overrides updated."));
    }

    private Guid? GetCallerId()
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(callerId, out var parsed) ? parsed : null;
    }
}
