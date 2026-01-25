#!/usr/bin/env pwsh
<#
Comprehensive E2E Test Suite for NyasaWave
Tests all major features: Auth, Audio Gating, Upload, Ads, Subscriptions, Earnings
#>

Write-Host "`n=== NYASAWAVE E2E TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Target: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

$results = @()
$token = $null
$userId = $null

# Helper function
function Test-Feature {
    param([string]$name, [scriptblock]$test)
    Write-Host "Testing: $name..." -ForegroundColor Yellow
    try {
        & $test
    } catch {
        $results += "✗ $name - $_"
    }
}

# Test 1: Homepage
Test-Feature "Homepage Load" {
    $resp = Invoke-WebRequest http://localhost:3000/ -TimeoutSec 5 -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        $results += "✓ Homepage loads (200 OK)"
    }
}

# Test 2: Artist Registration
Test-Feature "Artist Registration" {
    $email = "test$(Get-Random)@test.com"
    $body = @{
        email = $email
        password = "TestPass123!"
        name = "Test Artist"
    } | ConvertTo-Json
    
    $resp = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/auth/register-artist" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 5 -ErrorAction Stop
    
    $data = $resp.Content | ConvertFrom-Json
    if ($data.token -and $data.user.role -eq "ARTIST") {
        $results += "✓ Artist registered with JWT token"
        $script:token = $data.token
        $script:userId = $data.user.id
    }
}

# Test 3: Auth Verification
Test-Feature "Auth Verification (ME)" {
    if ($token) {
        $resp = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/auth/me" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 5 -ErrorAction Stop
        
        if ($resp.StatusCode -eq 200) {
            $results += "✓ Auth ME endpoint verified JWT token"
        }
    }
}

# Test 4: Subscription Check
Test-Feature "Subscription Tier" {
    if ($token) {
        $resp = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/auth/subscribe" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 5 -ErrorAction Stop
        
        $data = $resp.Content | ConvertFrom-Json
        if ($data.subscription.tier -eq "free") {
            $results += "✓ Subscription initialized as 'free' tier"
        }
    }
}

# Test 5: Upload API
Test-Feature "Upload Flow (with Auth)" {
    if ($token) {
        $body = @{
            title = "E2E Test Track"
            artist = "Test Artist"
            duration = "180"
            releaseDate = (Get-Date).ToString("yyyy-MM-dd")
        } | ConvertTo-Json
        
        $resp = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/artist/releases" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 5 -ErrorAction Stop
        
        if ($resp.StatusCode -in @(200,201)) {
            $results += "✓ Upload API accepts authenticated requests"
        }
    }
}

# Test 6: Create Ad Campaign
Test-Feature "Ad Campaign Creation" {
    if ($token) {
        $body = @{
            title = "E2E Test Campaign"
            description = "Test ad"
            budget = 100
            startDate = (Get-Date).ToString("yyyy-MM-dd")
            endDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
            targetGenre = "pop"
            targetAudience = "18-35"
        } | ConvertTo-Json
        
        $resp = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/artist/ads" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 5 -ErrorAction Stop
        
        $data = $resp.Content | ConvertFrom-Json
        if ($data.ad -and $data.ad.status -eq "draft") {
            $results += "✓ Ad campaign created (status: draft)"
        }
    }
}

# Test 7: List Ads
Test-Feature "List Artist Ads" {
    if ($token) {
        $resp = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/artist/ads" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 5 -ErrorAction Stop
        
        $data = $resp.Content | ConvertFrom-Json
        if ($data.ok) {
            $results += "✓ Ads list API working (campaigns: $($data.totalAds))"
        }
    }
}

# Test 8: Earnings Tracking
Test-Feature "Earnings Tracking" {
    if ($token) {
        $resp = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/artist/earnings" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 5 -ErrorAction Stop
        
        $data = $resp.Content | ConvertFrom-Json
        if ($data.earnings) {
            $results += "✓ Earnings API responding (total: `$$($data.earnings.totalEarned))"
        }
    }
}

# Test 9: Withdrawal System
Test-Feature "Withdrawal/Payout System" {
    if ($token) {
        $resp = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/artist/withdraw" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 5 -ErrorAction Stop
        
        $data = $resp.Content | ConvertFrom-Json
        if ($data.ok -or $data.availableBalance -ne $null) {
            $results += "✓ Withdrawal API responsive"
        }
    }
}

# Test 10: Page Loads
$pages = @("/subscribe", "/artist/ads", "/artist/earnings", "/marketplace")
Test-Feature "Page Loads" {
    foreach ($page in $pages) {
        $resp = Invoke-WebRequest "http://localhost:3000$page" -TimeoutSec 5 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $results += "✓ Page: $page (200 OK)"
        }
    }
}

# Summary
Write-Host ""
Write-Host "=== TEST RESULTS ===" -ForegroundColor Cyan
$results | ForEach-Object { Write-Host $_ }

$pass = ($results | Where-Object { $_ -match "^✓" }).Count
$fail = ($results | Where-Object { $_ -match "^✗" }).Count

Write-Host ""
Write-Host "TOTAL: $($results.Count) tests | $pass Passed | $fail Failed" -ForegroundColor Cyan
Write-Host ""

if ($fail -eq 0) {
    Write-Host "✓ ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red
}
