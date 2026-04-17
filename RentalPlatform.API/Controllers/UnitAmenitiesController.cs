using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.UnitAmenities;
using RentalPlatform.API.DTOs.Responses.UnitAmenities;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class UnitAmenitiesController : ControllerBase
{
    private readonly IUnitAmenityService _unitAmenityService;
    private readonly IUnitService _unitService;

    public UnitAmenitiesController(IUnitAmenityService unitAmenityService, IUnitService unitService)
    {
        _unitAmenityService = unitAmenityService;
        _unitService = unitService;
    }

    // 1. GET /api/units/{unitId}/amenities (Public for active units, Admin fallback for inactive)
    [HttpGet("api/units/{unitId}/amenities")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UnitAmenityResponse>>>> GetAmenitiesByUnitId(Guid unitId)
    {
        var unit = await _unitService.GetByIdAsync(unitId);
        
        if (unit == null)
            return NotFound(ApiResponse.CreateFailure("Unit not found."));

        // Enforce public read restrictions
        bool isAdmin = User.HasClaim("subjectType", "admin");
        if (!unit.IsActive && !isAdmin)
            return NotFound(ApiResponse.CreateFailure("Unit not found."));

        var amenities = await _unitAmenityService.GetAmenitiesAsync(unitId);
        var response = amenities.Select(a => new UnitAmenityResponse
        {
            AmenityId = a.Id,
            Name = a.Name,
            Icon = a.Icon ?? string.Empty
        }).ToList();
        
        return Ok(ApiResponse<IReadOnlyList<UnitAmenityResponse>>.CreateSuccess(response));
    }

    // 2. POST /api/internal/units/{unitId}/amenities (Internal)
    [HttpPost("api/internal/units/{unitId}/amenities")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse>> AssignAmenity(Guid unitId, AssignUnitAmenityRequest request)
    {
        await _unitAmenityService.AssignAsync(unitId, request.AmenityId);
        return Ok(ApiResponse.CreateSuccess(null, "Amenity assigned successfully."));
    }

    // 3. DELETE /api/internal/units/{unitId}/amenities/{amenityId} (Internal)
    [HttpDelete("api/internal/units/{unitId}/amenities/{amenityId}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse>> RemoveAmenity(Guid unitId, Guid amenityId)
    {
        await _unitAmenityService.RemoveAsync(unitId, amenityId);
        return Ok(ApiResponse.CreateSuccess(null, "Amenity removed successfully."));
    }

    // 4. PUT /api/internal/units/{unitId}/amenities (Internal)
    [HttpPut("api/internal/units/{unitId}/amenities")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UnitAmenityResponse>>>> ReplaceAmenities(Guid unitId, ReplaceUnitAmenitiesRequest request)
    {
        await _unitAmenityService.ReplaceAllAsync(unitId, request.AmenityIds);
        
        var amenities = await _unitAmenityService.GetAmenitiesAsync(unitId);
        var response = amenities.Select(a => new UnitAmenityResponse
        {
            AmenityId = a.Id,
            Name = a.Name,
            Icon = a.Icon ?? string.Empty
        }).ToList();
        
        return Ok(ApiResponse<IReadOnlyList<UnitAmenityResponse>>.CreateSuccess(response, "Amenities replaced successfully."));
    }
}
