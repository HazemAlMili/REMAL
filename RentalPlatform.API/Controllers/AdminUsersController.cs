using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.AdminUsers;
using RentalPlatform.API.DTOs.Responses.AdminUsers;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using RentalPlatform.API.Authorization;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/admin-users")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    [Authorize(Policy = PermissionKeys.SettingsAdmin)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AdminUserResponse>>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool includeInactive = true)
    {
        var admins = await _adminUserService.GetAllAsync(includeInactive);
        
        var totalCount = admins.Count;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        var pagedAdmins = admins
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToResponse)
            .ToList();

        var pagination = new PaginationMeta(totalCount, page, pageSize, totalPages);
        
        return Ok(ApiResponse<IReadOnlyList<AdminUserResponse>>.CreateSuccess(pagedAdmins, pagination: pagination));
    }

    [HttpPost]
    [Authorize(Policy = PermissionKeys.SettingsAdmin)]
    public async Task<ActionResult<ApiResponse<AdminUserResponse>>> Create(CreateAdminUserRequest request)
    {
        var admin = await _adminUserService.CreateAsync(
            request.Name,
            request.Email,
            request.Password,
            request.RoleTemplateId
        );

        return Ok(ApiResponse<AdminUserResponse>.CreateSuccess(MapToResponse(admin), "Admin user created successfully."));
    }

    [HttpPatch("{id}/role")]
    [Authorize(Policy = PermissionKeys.SettingsAdmin)]
    public async Task<ActionResult<ApiResponse<AdminUserResponse>>> UpdateRole(Guid id, UpdateAdminUserRoleRequest request)
    {
        var callerId = GetCallerId();
        if (callerId == null)
            return Unauthorized(ApiResponse.CreateFailure("Could not resolve the caller's identity."));
        if (callerId == id)
            return BadRequest(ApiResponse.CreateFailure("You cannot change your own role."));

        var admin = await _adminUserService.UpdateRoleAsync(id, request.RoleTemplateId);
        return Ok(ApiResponse<AdminUserResponse>.CreateSuccess(MapToResponse(admin), "Admin role updated successfully."));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = PermissionKeys.SettingsAdmin)]
    public async Task<ActionResult<ApiResponse<AdminUserResponse>>> UpdateStatus(Guid id, UpdateAdminUserStatusRequest request)
    {
        var callerId = GetCallerId();
        if (callerId == null)
            return Unauthorized(ApiResponse.CreateFailure("Could not resolve the caller's identity."));
        if (callerId == id)
            return BadRequest(ApiResponse.CreateFailure("You cannot change your own account's status."));

        await _adminUserService.SetActiveAsync(id, request.IsActive);
        var admin = await _adminUserService.GetByIdAsync(id);

        if (admin == null)
            return NotFound(ApiResponse.CreateFailure("Admin user not found after status update."));

        return Ok(ApiResponse<AdminUserResponse>.CreateSuccess(MapToResponse(admin), $"Admin user {(request.IsActive ? "activated" : "deactivated")} successfully."));
    }

    // Fail closed: a privileged mutation must not proceed when the caller's
    // identity claim is missing or malformed.
    private Guid? GetCallerId()
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(callerId, out var callerGuid) ? callerGuid : null;
    }

    private static AdminUserResponse MapToResponse(AdminUser admin)
    {
        return new AdminUserResponse(
            admin.Id,
            admin.Name,
            admin.Email,
            admin.Role,
            admin.RoleTemplateId,
            admin.RoleTemplate?.Name ?? admin.Role?.ToString() ?? "Custom",
            admin.IsActive,
            admin.CreatedAt,
            admin.UpdatedAt
        );
    }
}
