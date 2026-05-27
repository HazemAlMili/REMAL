using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Responses.OwnerPortal;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "OwnerOnly")]
public class OwnerPortalProfileController : ControllerBase
{
    private readonly IOwnerService _ownerService;

    public OwnerPortalProfileController(IOwnerService ownerService)
    {
        _ownerService = ownerService;
    }

    // GET /api/owner/profile
    [HttpGet("api/owner/profile")]
    public async Task<ActionResult<ApiResponse<OwnerPortalProfileResponse>>> GetProfile(
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var owner = await _ownerService.GetByIdAsync(ownerId, cancellationToken);
        if (owner == null)
            return NotFound(ApiResponse<OwnerPortalProfileResponse>.CreateFailure("Owner profile not found."));

        return Ok(ApiResponse<OwnerPortalProfileResponse>.CreateSuccess(new OwnerPortalProfileResponse
        {
            Id             = owner.Id,
            Name           = owner.Name,
            Phone          = owner.Phone,
            Email          = owner.Email,
            CommissionRate = owner.CommissionRate,
            Status         = owner.Status,
        }));
    }

    private Guid GetCurrentOwnerId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim) || !Guid.TryParse(subClaim, out var ownerId))
            throw new UnauthorizedAccessException("Current owner ID not found in claims.");

        return ownerId;
    }
}
