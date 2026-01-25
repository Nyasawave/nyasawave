Write-Host "=== NYASAWAVE PAGE ACCESSIBILITY TEST ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# Test all pages
$pages = @(
    "/", "/discover", "/artists", "/marketplace", "/pricing", "/business", "/investors",
    "/register", "/signin", "/upload", "/me", "/playlists", "/orders", "/analytics",
    "/admin", "/payment", "/checkout", "/subscribe",
    "/privacy", "/terms", "/copyright", "/refund", "/community-guidelines", "/seller-agreement"
)

$passed = 0
$failed = 0

Write-Host "Testing page accessibility..." -ForegroundColor Yellow
foreach ($page in $pages) {
    try {
        $resp = Invoke-WebRequest "http://localhost:3000$page" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        Write-Host "OK: $page - $($resp.StatusCode)"
        $passed++
    }
    catch {
        Write-Host "FAIL: $page"
        $failed++
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Passed: $passed"
Write-Host "Failed: $failed"
Write-Host "Total: $($passed + $failed)"
