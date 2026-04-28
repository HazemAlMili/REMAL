# API Reference Guide

This document provides a comprehensive list of the available API endpoints for the RentalPlatform project.

## 🔐 Authentication (AuthController)
Base Route: `/api/auth`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/client/register` | Public | Register a new client account. |
| **POST** | `/client/login` | Public | Login as a client (returns Access Token + Refresh Cookie). |
| **POST** | `/admin/login` | Public | Login as an administrator. |
| **POST** | `/owner/login` | Public | Login as a property owner. |
| **POST** | `/refresh` | Any | **Enforced:** Refresh access token using `refresh_token` cookie. |
| **POST** | `/logout` | Any | Clear the refresh token cookie. |

## 🏘️ Areas (AreasController)
Base Route: `/api/areas`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | List all geographic areas. |
| **GET** | `/{id}` | Public | Get details for a specific area. |
| **POST** | `/` | Admin | Create a new area. |
| **PUT** | `/{id}` | Admin | Update area details. |
| **DELETE** | `/{id}` | SuperAdmin | Soft delete an area. |

## 🏠 Units (UnitsController)
Base Route: `/api/units`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Search and filter units by area, type, and dates. |
| **GET** | `/{id}` | Public | Get full unit details (amenities, pricing, description). |

## 👤 Admin & User Management
| Controller | Access | Description |
| :--- | :--- | :--- |
| `AdminUsersController` | SuperAdmin | Manage system admins, sales, and finance accounts. |
| `ClientsController` | Admin/Sales | View client profiles, loyalty stats, and booking history. |
| `OwnersController` | Admin/Finance | Manage property owners and their commission rates. |

## ✨ Amenities (AmenitiesController)
Base Route: `/api/amenities`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | List all configured amenities (e.g., Wifi, Pool). |
| **POST** | `/` | SuperAdmin | Define a new amenity type. |

---

## 🛠️ How to Test
1. **Interactive Docs**: Run the project and visit `/swagger`.
2. **Automated Testing**: Use the [api_tests.http](file:///d:/Clinets/Remal/REMAL/RentalPlatform.API/api_tests.http) file in VS/VS Code.
3. **Setup Guide**: Refer to the [Testing Guide](file:///d:/Clinets/Remal/REMAL/docs/setup/testing_guide.md) for step-by-step instructions.

> [!TIP]
> All administrative and write operations require an `Authorization: Bearer <token>` header. Use the login endpoints to generate this token.
