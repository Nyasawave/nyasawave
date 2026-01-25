# Start the dev server in the background
Write-Host "Starting dev server..."
$serverProcess = Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory "e:\nyasawave-projects\nyasawave" -NoNewWindow -PassThru

Write-Host "Server PID: $($serverProcess.Id)"
Write-Host "Waiting 30 seconds for server to start..."
Start-Sleep -Seconds 30

# Test the home page
Write-Host "Testing home page..."
try {
    $homeResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    Write-Host "Home page status: $($homeResponse.StatusCode)"
}
catch {
    Write-Host "Home page failed: $_"
}

# Test register endpoint
Write-Host "Testing register endpoint..."
try {
    $registerBody = @{
        name     = "Test User"
        email    = "test@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody -UseBasicParsing -ErrorAction Stop
    Write-Host "Register status: $($registerResponse.StatusCode)"
    Write-Host "Register response: $($registerResponse.Content)"
}
catch {
    Write-Host "Register failed: $_"
}

# Stop the server
Write-Host "Stopping server..."
Stop-Process -Id $serverProcess.Id -Force
