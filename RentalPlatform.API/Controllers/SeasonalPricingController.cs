using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.SeasonalPricing;
using RentalPlatform.API.DTOs.Responses.SeasonalPricing;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class SeasonalPricingController : ControllerBase
{
    private readonly ISeasonalPricingService _seasonalPricingService;

    public SeasonalPricingController(ISeasonalPricingService seasonalPricingService)
    {
        _seasonalPricingService = seasonalPricingService;
    }

    // 1. GET /api/internal/units/{unitId}/seasonal-pricing
    [HttpGet("api/internal/units/{unitId}/seasonal-pricing")]
    [Authorize(Policy = "SalesOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SeasonalPricingResponse>>>> GetByUnitId(Guid unitId)
    {
        var pricings = await _seasonalPricingService.GetByUnitIdAsync(unitId);
        var response = pricings.Select(MapToResponse).ToList();
        
        return Ok(ApiResponse<IReadOnlyList<SeasonalPricingResponse>>.CreateSuccess(response));
    }

    // 2. POST /api/internal/units/{unitId}/seasonal-pricing
    [HttpPost("api/internal/units/{unitId}/seasonal-pricing")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<SeasonalPricingResponse>>> Create(Guid unitId, CreateSeasonalPricingRequest request)
    {
        var pricing = await _seasonalPricingService.CreateAsync(
            unitId,
            request.StartDate,
            request.EndDate,
            request.PricePerNight
        );
        
        return Ok(ApiResponse<SeasonalPricingResponse>.CreateSuccess(MapToResponse(pricing), "Seasonal pricing created successfully."));
    }

    // 3. PUT /api/internal/seasonal-pricing/{id}
    [HttpPut("api/internal/seasonal-pricing/{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<SeasonalPricingResponse>>> Update(Guid id, UpdateSeasonalPricingRequest request)
    {
        var pricing = await _seasonalPricingService.UpdateAsync(
            id,
            request.StartDate,
            request.EndDate,
            request.PricePerNight
        );
        
        return Ok(ApiResponse<SeasonalPricingResponse>.CreateSuccess(MapToResponse(pricing), "Seasonal pricing updated successfully."));
    }

    // 4. DELETE /api/internal/seasonal-pricing/{id}
    [HttpDelete("api/internal/seasonal-pricing/{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        await _seasonalPricingService.DeleteAsync(id);
        return Ok(ApiResponse.CreateSuccess(null, "Seasonal pricing deleted successfully."));
    }

    private static SeasonalPricingResponse MapToResponse(SeasonalPricing pricing)
    {
        return new SeasonalPricingResponse
        {
            Id = pricing.Id,
            UnitId = pricing.UnitId,
            StartDate = pricing.StartDate,
            EndDate = pricing.EndDate,
            PricePerNight = pricing.PricePerNight,
            CreatedAt = pricing.CreatedAt,
            UpdatedAt = pricing.UpdatedAt
        };
    }
}
