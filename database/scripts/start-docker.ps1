# PostgreSQL Database Setup Script
# This script starts the PostgreSQL database using Docker

Write-Host "🐘 Starting PostgreSQL Database..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    Write-Host "  Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Navigate to database directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$databasePath = Split-Path -Parent $scriptPath
Set-Location $databasePath

Write-Host ""
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start PostgreSQL container" -ForegroundColor Red
    exit 1
}

Write-Host "✓ PostgreSQL container started" -ForegroundColor Green

# Wait for database to be ready
Write-Host ""
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    $healthStatus = docker inspect --format='{{.State.Health.Status}}' ticket-aggregator-db 2>$null
    
    if ($healthStatus -eq "healthy") {
        Write-Host "✓ Database is healthy and ready!" -ForegroundColor Green
        break
    }
    
    Write-Host "  Attempt $attempt/$maxAttempts - Status: $healthStatus" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($attempt -eq $maxAttempts) {
    Write-Host "✗ Database failed to become healthy" -ForegroundColor Red
    Write-Host "  Run 'docker-compose logs postgres' to see logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✓ PostgreSQL Database Information:" -ForegroundColor Green
Write-Host "  Container: ticket-aggregator-db" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Database: ticket_aggregator" -ForegroundColor White
Write-Host "  Username: ticketuser" -ForegroundColor White
Write-Host "  Password: ticketpass123" -ForegroundColor White
Write-Host ""
Write-Host "  Connection String:" -ForegroundColor Cyan
Write-Host "  postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update DATABASE_URL in .env file" -ForegroundColor White
Write-Host "2. Run: npx prisma generate" -ForegroundColor White
Write-Host "3. Run: npx prisma db push" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""
