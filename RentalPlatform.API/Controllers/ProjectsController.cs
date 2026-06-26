using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.Projects;
using RentalPlatform.API.DTOs.Responses.Projects;
using RentalPlatform.API.Models;
using RentalPlatform.API.Authorization;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProjectResponse>>>> GetAll([FromQuery] bool includeInactive = false)
    {
        // Only allow internal admins to see inactive projects
        bool canSeeInactive = includeInactive && User.HasClaim("subjectType", "admin");
        
        var projects = await _projectService.GetAllAsync(canSeeInactive);
        var response = projects.Select(MapToResponse).ToList();
        
        return Ok(ApiResponse<IReadOnlyList<ProjectResponse>>.CreateSuccess(response));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<ProjectResponse>>> GetById(Guid id)
    {
        var project = await _projectService.GetByIdAsync(id);
        
        if (project == null)
            return NotFound(ApiResponse.CreateFailure("Project not found."));

        // If project is inactive, check if the caller is an admin
        if (!project.IsActive && !User.HasClaim("subjectType", "admin"))
            return NotFound(ApiResponse.CreateFailure("Project not found."));

        return Ok(ApiResponse<ProjectResponse>.CreateSuccess(MapToResponse(project)));
    }

    [HttpPost]
    [Authorize(Policy = PermissionKeys.ProjectsManage)]
    public async Task<ActionResult<ApiResponse<ProjectResponse>>> Create(CreateProjectRequest request)
    {
        var project = await _projectService.CreateAsync(request.Name, request.Description, request.IsActive);
        return Ok(ApiResponse<ProjectResponse>.CreateSuccess(MapToResponse(project), "Project created successfully."));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = PermissionKeys.ProjectsManage)]
    public async Task<ActionResult<ApiResponse<ProjectResponse>>> Update(Guid id, UpdateProjectRequest request)
    {
        var project = await _projectService.UpdateAsync(id, request.Name, request.Description, request.IsActive);
        return Ok(ApiResponse<ProjectResponse>.CreateSuccess(MapToResponse(project), "Project updated successfully."));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = PermissionKeys.ProjectsManage)]
    public async Task<ActionResult<ApiResponse<ProjectResponse>>> UpdateStatus(Guid id, UpdateProjectStatusRequest request)
    {
        await _projectService.SetActiveAsync(id, request.IsActive);
        var project = await _projectService.GetByIdAsync(id);
        
        if (project == null)
            return NotFound(ApiResponse.CreateFailure("Project not found after status update."));

        return Ok(ApiResponse<ProjectResponse>.CreateSuccess(MapToResponse(project), $"Project {(request.IsActive ? "activated" : "deactivated")} successfully."));
    }

    private static ProjectResponse MapToResponse(Project project)
    {
        return new ProjectResponse(
            project.Id,
            project.Name,
            project.Description,
            project.IsActive,
            project.CreatedAt,
            project.UpdatedAt
        );
    }
}
