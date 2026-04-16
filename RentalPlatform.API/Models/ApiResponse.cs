using System;

namespace RentalPlatform.API.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string[]? Errors { get; set; }
    public PaginationMeta? Pagination { get; set; }

    public static ApiResponse<T> CreateSuccess(T data, string? message = null, PaginationMeta? pagination = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            Pagination = pagination
        };
    }

    public static ApiResponse<T> CreateFailure(string? message, string[]? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Data = default,
            Message = message,
            Errors = errors ?? Array.Empty<string>()
        };
    }
}

public class ApiResponse : ApiResponse<object>
{
    public static new ApiResponse CreateSuccess(object? data = null, string? message = null, PaginationMeta? pagination = null)
    {
        return new ApiResponse
        {
            Success = true,
            Data = data,
            Message = message,
            Pagination = pagination
        };
    }

    public static new ApiResponse CreateFailure(string? message, string[]? errors = null)
    {
        return new ApiResponse
        {
            Success = false,
            Data = null,
            Message = message,
            Errors = errors ?? Array.Empty<string>()
        };
    }
}
