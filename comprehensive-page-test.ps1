# Comprehensive Page Test Script
Write-Host "=== NYASAWAVE COMPREHENSIVE PAGE TEST ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# Test Results
$results = @()

# Define all pages to test
$pages = @(
    @{path = "/"; name = "Home" },
    @{path = "/discover"; name = "Discover" },
    @{path = "/artists"; name = "Artists" },
    @{path = "/marketplace"; name = "Marketplace" },
    @{path = "/pricing"; name = "Pricing" },
    @{path = "/business"; name = "Business" },
    @{path = "/investors"; name = "Investors" },
    @{path = "/register"; name = "Register" },
    @{path = "/signin"; name = "SignIn" },
    @{path = "/upload"; name = "Upload" },
    @{path = "/me"; name = "User Profile" },
    @{path = "/playlists"; name = "Playlists" },
    @{path = "/orders"; name = "Orders" },
    @{path = "/analytics"; name = "Analytics" },
    @{path = "/admin"; name = "Admin Dashboard" },
    @{path = "/payment"; name = "Payment" },
    @{path = "/checkout"; name = "Checkout" },
    @{path = "/subscribe"; name = "Subscribe" },
    @{path = "/privacy"; name = "Privacy Policy" },
    @{path = "/terms"; name = "Terms of Service" },
    @{path = "/copyright"; name = "Copyright" },
    @{path = "/refund"; name = "Refund Policy" },
    @{path = "/community-guidelines"; name = "Community Guidelines" },
    @{path = "/seller-agreement"; name = "Seller Agreement" }
)

# Test each page
Write-Host "Testing page accessibility..." -ForegroundColor Yellow
foreach ($page in $pages) {
    try {
        $resp = Invoke-WebRequest "http://localhost:3000$($page.path)" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $status = $resp.StatusCode
        $result = "✓"
        $color = "Green"
    }
    catch {
        $status = $_.Exception.Response.StatusCode
        if ($null -eq $status) { $status = "ERROR" }
        $result = "✗"
        $color = "Red"
    }
    
    $results += @{
        path   = $page.path
        name   = $page.name
        status = $status
        result = $result
    }
    
    Write-Host "$result $($page.name.PadRight(25)) - $status" -ForegroundColor $color
}

# API Tests
Write-Host ""
Write-Host "Testing API endpoints..." -ForegroundColor Yellow

$apiTests = @(
    @{method = "GET"; path = "/api/auth/me"; name = "Get Current User" },
    @{method = "POST"; path = "/api/auth/login"; name = "Login" }
)

# Test Login
try {
    $loginBody = @{email = "trapkost2020@gmail.com"; password = "password123" } | ConvertTo-Json
    $resp = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing -TimeoutSec 10
    Write-Host "✓ Login API - $($resp.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Login API - ERROR" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
$passCount = ($results | Where-Object { $_.result -eq "✓" }).Count
$totalCount = $results.Count
Write-Host "Pages Accessible: $passCount / $totalCount" -ForegroundColor Green
Write-Host ""
Write-Host "Failed Pages:" -ForegroundColor Yellow
$results | Where-Object { $_.result -eq "✗" } | ForEach-Object { Write-Host "  - $($_.name) ($($_.path))" }

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
