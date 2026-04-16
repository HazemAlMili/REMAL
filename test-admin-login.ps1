# Admin Login Test Script
$loginBody = @{
    email = "superadmin.dev@rental.local"
    password = "Admin@1234"
} | ConvertTo-Json

Write-Host "Step 1: Login as SuperAdmin..." -ForegroundColor Cyan

$loginResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResp.data.accessToken
$userId = $loginResp.data.user.userId
$role = $loginResp.data.user.adminRole

Write-Host "✅ Login Success!" -ForegroundColor Green
Write-Host "User ID: $userId" -ForegroundColor Green
Write-Host "Role: $role" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0,50))..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Get Admin Users with Token..." -ForegroundColor Cyan

$headers = @{
    Authorization = "Bearer $token"
}

$usuariosResp = Invoke-RestMethod -Uri "http://localhost:5000/api/admin-users" `
    -Method Get `
    -Headers $headers

Write-Host "✅ Got Admin Users!" -ForegroundColor Green
$usuariosResp.data | ForEach-Object {
    Write-Host "  • $($_.name) ($($_.email)) — Role: $($_.role) — Active: $($_.isActive)" -ForegroundColor Cyan
}
