using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.Units;
using RentalPlatform.API.DTOs.Responses.Units;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class UnitsController : ControllerBase
{
    private readonly IUnitService _unitService;

    public UnitsController(IUnitService unitService)
    {
        _unitService = unitService;
    }

    // 1. GET /api/units (Public)
    [HttpGet("api/units")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UnitListItemResponse>>>> GetPublicUnits([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var allUnits = await _unitService.GetAllAsync(includeInactive: false);
        // Only active units
        var activeUnits = allUnits.Where(u => u.IsActive).ToList();
        
        int total = activeUnits.Count;
        int totalPages = (int)Math.Ceiling(total / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        var pagedUnits = activeUnits.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        
        var response = pagedUnits.Select(MapToListItemResponse).ToList();
        var pagination = new PaginationMeta(total, page, pageSize, totalPages);
        
        return Ok(ApiResponse<IReadOnlyList<UnitListItemResponse>>.CreateSuccess(response, null, pagination));
    }

    // 2. GET /api/units/{id} (Public)
    [HttpGet("api/units/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<UnitDetailsResponse>>> GetPublicUnitById(Guid id)
    {
        var unit = await _unitService.GetByIdAsync(id);
        
        if (unit == null || !unit.IsActive)
            return NotFound(ApiResponse.CreateFailure("Active unit not found."));

        return Ok(ApiResponse<UnitDetailsResponse>.CreateSuccess(MapToDetailsResponse(unit)));
    }

    // 3. GET /api/internal/units (Internal)
    [HttpGet("api/internal/units")]
    [Authorize(Policy = "SalesOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UnitListItemResponse>>>> GetInternalUnits([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] bool includeInactive = true)
    {
        var allUnits = await _unitService.GetAllAsync(includeInactive: includeInactive);
        
        int total = allUnits.Count;
        int totalPages = (int)Math.Ceiling(total / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        var pagedUnits = allUnits.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        
        var response = pagedUnits.Select(MapToListItemResponse).ToList();
        var pagination = new PaginationMeta(total, page, pageSize, totalPages);
        
        return Ok(ApiResponse<IReadOnlyList<UnitListItemResponse>>.CreateSuccess(response, null, pagination));
    }

    // 4. GET /api/internal/units/{id} (Internal)
    [HttpGet("api/internal/units/{id}")]
    [Authorize(Policy = "SalesOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<UnitDetailsResponse>>> GetInternalUnitById(Guid id)
    {
        var unit = await _unitService.GetByIdAsync(id);
        
        if (unit == null)
            return NotFound(ApiResponse.CreateFailure("Unit not found."));

        return Ok(ApiResponse<UnitDetailsResponse>.CreateSuccess(MapToDetailsResponse(unit)));
    }

    // 5. POST /api/internal/units
    [HttpPost("api/internal/units")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<UnitDetailsResponse>>> CreateUnit(CreateUnitRequest request)
    {
        var unit = await _unitService.CreateAsync(
            request.OwnerId,
            request.AreaId,
            request.Name,
            request.Description,
            request.Address,
            request.UnitType,
            request.Bedrooms,
            request.Bathrooms,
            request.MaxGuests,
            request.BasePricePerNight,
            request.IsActive
        );
        
        return Ok(ApiResponse<UnitDetailsResponse>.CreateSuccess(MapToDetailsResponse(unit), "Unit created successfully."));
    }

    // 6. PUT /api/internal/units/{id}
    [HttpPut("api/internal/units/{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<UnitDetailsResponse>>> UpdateUnit(Guid id, UpdateUnitRequest request)
    {
        var unit = await _unitService.UpdateAsync(
            id,
            request.OwnerId,
            request.AreaId,
            request.Name,
            request.Description,
            request.Address,
            request.UnitType,
            request.Bedrooms,
            request.Bathrooms,
            request.MaxGuests,
            request.BasePricePerNight,
            request.IsActive
        );
        
        return Ok(ApiResponse<UnitDetailsResponse>.CreateSuccess(MapToDetailsResponse(unit), "Unit updated successfully."));
    }

    // 7. PATCH /api/internal/units/{id}/status
    [HttpPatch("api/internal/units/{id}/status")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<UnitDetailsResponse>>> UpdateUnitStatus(Guid id, UpdateUnitStatusRequest request)
    {
        await _unitService.SetActiveAsync(id, request.IsActive);
        
        var unit = await _unitService.GetByIdAsync(id);
        if (unit == null)
            return NotFound(ApiResponse.CreateFailure("Unit not found after status update."));

        return Ok(ApiResponse<UnitDetailsResponse>.CreateSuccess(MapToDetailsResponse(unit), $"Unit status updated to {(request.IsActive ? "active" : "inactive")}."));
    }

    // 8. DELETE /api/internal/units/{id}
    [HttpDelete("api/internal/units/{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse>> DeleteUnit(Guid id)
    {
        await _unitService.SoftDeleteAsync(id);
        return Ok(ApiResponse.CreateSuccess(null, "Unit soft-deleted successfully."));
    }


    private static UnitListItemResponse MapToListItemResponse(Unit unit)
    {
        return new UnitListItemResponse
        {
            Id = unit.Id,
            OwnerId = unit.OwnerId,
            AreaId = unit.AreaId,
            Name = unit.Name,
            UnitType = unit.UnitType,
            Bedrooms = unit.Bedrooms,
            Bathrooms = unit.Bathrooms,
            MaxGuests = unit.MaxGuests,
            BasePricePerNight = unit.BasePricePerNight,
            IsActive = unit.IsActive,
            CreatedAt = unit.CreatedAt
        };
    }

    private static UnitDetailsResponse MapToDetailsResponse(Unit unit)
    {
        return new UnitDetailsResponse
        {
            Id = unit.Id,
            OwnerId = unit.OwnerId,
            AreaId = unit.AreaId,
            Name = unit.Name,
            Description = unit.Description,
            Address = unit.Address,
            UnitType = unit.UnitType,
            Bedrooms = unit.Bedrooms,
            Bathrooms = unit.Bathrooms,
            MaxGuests = unit.MaxGuests,
            BasePricePerNight = unit.BasePricePerNight,
            IsActive = unit.IsActive,
            CreatedAt = unit.CreatedAt,
            UpdatedAt = unit.UpdatedAt
        };
    }
}
