using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.OwnerPortal;
using RentalPlatform.API.DTOs.Responses.OwnerPortal;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "OwnerOnly")]
public class OwnerPortalUnitsController : ControllerBase
{
    private readonly IOwnerPortalUnitService _unitService;

    public OwnerPortalUnitsController(IOwnerPortalUnitService unitService)
    {
        _unitService = unitService;
    }

    // GET /api/owner/units
    [HttpGet("api/owner/units")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<OwnerPortalUnitResponse>>>> GetUnits(
        [FromQuery] GetOwnerPortalUnitsRequest request,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var units = await _unitService.GetAllByOwnerAsync(
            ownerId,
            isActive: request.IsActive,
            areaId: request.AreaId,
            cancellationToken: cancellationToken);

        var totalCount = units.Count;
        var paged = units
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(MapToResponse)
            .ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);
        var pagination = new PaginationMeta(totalCount, request.Page, request.PageSize, totalPages);

        return Ok(ApiResponse<IReadOnlyList<OwnerPortalUnitResponse>>.CreateSuccess(paged, pagination: pagination));
    }

    // GET /api/owner/units/{unitId}
    [HttpGet("api/owner/units/{unitId}")]
    public async Task<ActionResult<ApiResponse<OwnerPortalUnitResponse>>> GetUnit(
        Guid unitId,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var unit = await _unitService.GetByOwnerAndUnitIdAsync(ownerId, unitId, cancellationToken);

        return Ok(ApiResponse<OwnerPortalUnitResponse>.CreateSuccess(MapToResponse(unit!)));
    }

    private Guid GetCurrentOwnerId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim) || !Guid.TryParse(subClaim, out var ownerId))
            throw new UnauthorizedAccessException("Current owner ID not found in claims.");

        return ownerId;
    }

    private static OwnerPortalUnitResponse MapToResponse(OwnerPortalUnitOverview unit) =>
        new()
        {
            UnitId             = unit.UnitId,
            AreaId             = unit.AreaId,
            UnitName           = unit.UnitName,
            UnitType           = unit.UnitType,
            IsActive           = unit.IsActive,
            Bedrooms           = unit.Bedrooms,
            Bathrooms          = unit.Bathrooms,
            MaxGuests          = unit.MaxGuests,
            BasePricePerNight  = unit.BasePricePerNight,
            CreatedAt          = unit.CreatedAt,
            UpdatedAt          = unit.UpdatedAt,
        };
}
