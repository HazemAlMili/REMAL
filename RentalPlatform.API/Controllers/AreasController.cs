using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.Areas;
using RentalPlatform.API.DTOs.Responses.Areas;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AreasController : ControllerBase
{
    private readonly IAreaService _areaService;

    public AreasController(IAreaService areaService)
    {
        _areaService = areaService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AreaResponse>>>> GetAll([FromQuery] bool includeInactive = false)
    {
        // Only allow internal admins to see inactive areas
        bool canSeeInactive = includeInactive && User.HasClaim("subjectType", "admin");
        
        var areas = await _areaService.GetAllAsync(canSeeInactive);
        var response = areas.Select(MapToResponse).ToList();
        
        return Ok(ApiResponse<IReadOnlyList<AreaResponse>>.CreateSuccess(response));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AreaResponse>>> GetById(Guid id)
    {
        var area = await _areaService.GetByIdAsync(id);
        
        if (area == null)
            return NotFound(ApiResponse.CreateFailure("Area not found."));

        // If area is inactive, check if the caller is an admin
        if (!area.IsActive && !User.HasClaim("subjectType", "admin"))
            return NotFound(ApiResponse.CreateFailure("Area not found."));

        return Ok(ApiResponse<AreaResponse>.CreateSuccess(MapToResponse(area)));
    }

    [HttpPost]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<AreaResponse>>> Create(CreateAreaRequest request)
    {
        var area = await _areaService.CreateAsync(request.Name, request.Description, request.IsActive);
        return Ok(ApiResponse<AreaResponse>.CreateSuccess(MapToResponse(area), "Area created successfully."));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<AreaResponse>>> Update(Guid id, UpdateAreaRequest request)
    {
        var area = await _areaService.UpdateAsync(id, request.Name, request.Description, request.IsActive);
        return Ok(ApiResponse<AreaResponse>.CreateSuccess(MapToResponse(area), "Area updated successfully."));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<AreaResponse>>> UpdateStatus(Guid id, UpdateAreaStatusRequest request)
    {
        await _areaService.SetActiveAsync(id, request.IsActive);
        var area = await _areaService.GetByIdAsync(id);
        
        if (area == null)
            return NotFound(ApiResponse.CreateFailure("Area not found after status update."));

        return Ok(ApiResponse<AreaResponse>.CreateSuccess(MapToResponse(area), $"Area {(request.IsActive ? "activated" : "deactivated")} successfully."));
    }

    private static AreaResponse MapToResponse(Area area)
    {
        return new AreaResponse(
            area.Id,
            area.Name,
            area.Description,
            area.IsActive,
            area.CreatedAt,
            area.UpdatedAt
        );
    }
}
