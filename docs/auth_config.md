# Authentication & Environment Configuration Guide

This document outlines the required configuration for running the RentalPlatform API in different environments.

## 1. Environment Variable Overrides

For production and staging environments, sensitive configuration values must be provided via environment variables. ASP.NET Core automatically maps these based on the structure defined in `appsettings.json`.

| Setting | Environment Variable | Note |
|---------|----------------------|------|
| JWT Secret | `Jwt__Secret` | Must be at least 32 characters long. |
| Database Connection | `ConnectionStrings__DefaultConnection` | Full PostgreSQL connection string. |

> [!IMPORTANT]
> Always use double underscores (`__`) to separate sections in environment variable names to ensure they are correctly mapped to the configuration hierarchy.

## 2. Cookie Security Behavior

The system automatically adjusts the security of the refresh token cookie based on the current hosting environment:

- **Development Environment (`ASPNETCORE_ENVIRONMENT=Development`):**
  - `Secure = false`: Allows local testing over HTTP.
- **Other Environments (Production, Staging, etc.):**
  - `Secure = true`: Enforces HTTPS for cookie transmission. This is critical for security in production.

## 3. Local Development

For local development, the system uses `appsettings.Development.json`. This file is ignored by Git in most standard setups (ensure your `.gitignore` includes it if it doesn't already, though for this project we've added it to the repository to help with initial setup).

### Current Development Secret (Placeholder):
`A_Very_Long_And_Secure_Secret_Key_For_Jwt_Signing_At_Least_32_Chars_DEVELOPMENT`

> [!WARNING]
> Never use the development secret in any publicly accessible or production environment.
