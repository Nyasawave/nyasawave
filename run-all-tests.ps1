#!/usr/bin/env pwsh
# NyasaWave Automated Testing Suite
# Run this after: npm run dev

param(
    [string]$BaseUrl = "http://localhost:3000",
    [int]$MaxRetries = 10,
    [int]$RetryDelaySeconds = 2
)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$Global:Results = @()
$Global:PassCount = 0
$Global:FailCount = 0
$Global:TestStartTime = Get-Date

function Write-Title {
    param([string]$Title)
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-TestHeader {
    param([string]$Header)
    Write-Host "`n$Header" -ForegroundColor Yellow
    Write-Host ("-" * 40) -ForegroundColor Gray
}

function Test-Page {
    param([string]$Path, [string]$Description)
    
    $url = "$BaseUrl$Path"
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -SkipHttpErrorCheck -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
        $success = ($statusCode -eq 200)
        
        if ($success) {
            Write-Host "  ✅ $Description ($statusCode)" -ForegroundColor Green
            $Global:PassCount++
        }
        else {
            Write-Host "  ❌ $Description ($statusCode)" -ForegroundColor Red
            $Global:FailCount++
        }
        
        $Global:Results += @{
            Type    = "Page"
            Name    = $Description
            Path    = $Path
            Status  = "HTTP $statusCode"
            Success = $success
        }
        
        return $success
    }
    catch {
        Write-Host "  ❌ $Description (Error: Connection refused)" -ForegroundColor Red
        $Global:FailCount++
        
        $Global:Results += @{
            Type    = "Page"
            Name    = $Description
            Path    = $Path
            Status  = "Connection Error"
            Success = $false
        }
        
        return $false
    }
}

function Test-API {
    param([string]$Method, [string]$Endpoint, [hashtable]$Body, [string]$Description)
    
    $url = "$BaseUrl/api$Endpoint"
    try {
        $params = @{
            Uri                = $url
            Method             = $Method
            TimeoutSec         = 5
            SkipHttpErrorCheck = $true
            ErrorAction        = 'SilentlyContinue'
            Headers            = @{ 'Content-Type' = 'application/json' }
        }
        
        if ($Body) {
            $params['Body'] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $success = ($statusCode -ge 200 -and $statusCode -lt 300)
        
        if ($success) {
            Write-Host "  ✅ $Description ($statusCode)" -ForegroundColor Green
            $Global:PassCount++
        }
        else {
            Write-Host "  ❌ $Description ($statusCode)" -ForegroundColor Red
            $Global:FailCount++
        }
        
        $Global:Results += @{
            Type     = "API"
            Name     = $Description
            Endpoint = $Endpoint
            Method   = $Method
            Status   = "HTTP $statusCode"
            Success  = $success
        }
        
        return $success
    }
    catch {
        Write-Host "  ❌ $Description (Error)" -ForegroundColor Red
        $Global:FailCount++
        
        $Global:Results += @{
            Type     = "API"
            Name     = $Description
            Endpoint = $Endpoint
            Method   = $Method
            Status   = "Error"
            Success  = $false
        }
        
        return $false
    }
}

function Wait-ForServer {
    Write-Host "`n🔍 Waiting for server..." -ForegroundColor Cyan
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 2 -SkipHttpErrorCheck -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Server is responding!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Server not ready yet
        }
        
        if ($i -lt $MaxRetries) {
            Write-Host "Attempt $i/$MaxRetries - Still starting... (waiting $RetryDelaySeconds seconds)" -ForegroundColor Gray
            Start-Sleep -Seconds $RetryDelaySeconds
        }
    }
    
    Write-Host "❌ Server did not respond after $($MaxRetries * $RetryDelaySeconds) seconds" -ForegroundColor Red
    return $false
}

# Main Test Execution
Write-Title "🧪 NyasaWave Comprehensive Test Suite"

# Wait for server
if (-not (Wait-ForServer)) {
    Write-Host "`n❌ Cannot connect to server at $BaseUrl" -ForegroundColor Red
    Write-Host "Make sure the dev server is running: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test Pages
Write-TestHeader "📄 Testing Public Pages"
Test-Page "/" "Homepage"
Test-Page "/discover" "Discover Page"
Test-Page "/pricing" "Pricing"
Test-Page "/investors" "Investors"
Test-Page "/business" "Business"

Write-TestHeader "🔐 Testing Auth Pages"
Test-Page "/login" "Login"
Test-Page "/signin" "SignIn"
Test-Page "/register" "Register"
Test-Page "/forgot" "Forgot Password"

Write-TestHeader "🔒 Testing Protected Pages"
Test-Page "/upload" "Upload"
Test-Page "/me" "Profile"
Test-Page "/playlists" "Playlists"
Test-Page "/artists" "Artists"
Test-Page "/marketplace" "Marketplace"
Test-Page "/payment" "Payment"

Write-TestHeader "👨‍💼 Testing Admin Pages"
Test-Page "/admin" "Admin Dashboard"
Test-Page "/admin/analytics" "Analytics"

# Test API Endpoints
Write-TestHeader "🎵 Testing Songs API"
Test-API "GET" "/songs" $null "Get All Songs"
Test-API "GET" "/songs?limit=10&offset=0" $null "Get Songs (Paginated)"

Write-TestHeader "🔑 Testing Auth API"
$timestamp = [int](Get-Date -UFormat %s)
$newUser = @{
    username = "testuser_$timestamp"
    email    = "test_$timestamp@nyasawave.com"
    password = "SecurePass123!"
}
Test-API "POST" "/auth/register" $newUser "Register New User"
Test-API "POST" "/auth/login" @{email = "test@nyasawave.com"; password = "test123" } "Login Existing User"

Write-TestHeader "⚙️ Testing Admin API"
Test-API "GET" "/admin/users" $null "Get Users List"
Test-API "GET" "/admin/analytics" $null "Get Analytics"

# Summary
Write-Title "📊 Test Results Summary"

$TotalTests = $Global:PassCount + $Global:FailCount
$PassPercentage = if ($TotalTests -gt 0) { [int](($Global:PassCount / $TotalTests) * 100) } else { 0 }

Write-Host "`n📈 Results:" -ForegroundColor Cyan
Write-Host "   ✅ Passed: $($Global:PassCount)" -ForegroundColor Green
Write-Host "   ❌ Failed: $($Global:FailCount)" -ForegroundColor Red
Write-Host "   📊 Total:  $TotalTests" -ForegroundColor Cyan
Write-Host "   📈 Pass Rate: $PassPercentage%" -ForegroundColor $(if ($PassPercentage -eq 100) { "Green" } else { "Yellow" })

$TestDuration = ((Get-Date) - $Global:TestStartTime).TotalSeconds
Write-Host "`n⏱️  Test Duration: $([Math]::Round($TestDuration, 2)) seconds" -ForegroundColor Cyan

# Detailed Results
if ($Global:Results.Count -gt 0) {
    Write-Host "`n📋 Detailed Results:" -ForegroundColor Cyan
    Write-Host ("-" * 80)
    
    $Global:Results | Group-Object Type | ForEach-Object {
        Write-Host "`n$($_.Name)s:" -ForegroundColor Yellow
        $_.Group | ForEach-Object {
            $icon = if ($_.Success) { "✅" } else { "❌" }
            Write-Host "$icon $($_.Name) - $($_.Status)" -ForegroundColor $(if ($_.Success) { "Green" } else { "Red" })
        }
    }
}

# Final Status
Write-Host "`n" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
if ($Global:FailCount -eq 0) {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "The application is ready for deployment" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "Review the errors above and fix any issues" -ForegroundColor Yellow
    exit 1
}
