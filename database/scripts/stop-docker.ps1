# Stop PostgreSQL Docker Container

Write-Host "🛑 Stopping PostgreSQL Database..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$databasePath = Split-Path -Parent $scriptPath
Set-Location $databasePath

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL container stopped" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to stop container" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Database stopped. Data is preserved in Docker volume." -ForegroundColor Yellow
Write-Host "To start again, run: .\scripts\start-docker.ps1" -ForegroundColor White
Write-Host ""
