# Reset PostgreSQL Database
# WARNING: This will delete all data!

Write-Host "⚠️  WARNING: Database Reset" -ForegroundColor Red
Write-Host "This will DELETE ALL DATA in the database!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Are you sure you want to continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Resetting PostgreSQL Database..." -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$databasePath = Split-Path -Parent $scriptPath
Set-Location $databasePath

# Stop and remove containers and volumes
Write-Host "Stopping containers and removing volumes..." -ForegroundColor Yellow
docker-compose down -v

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to stop containers" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Containers and volumes removed" -ForegroundColor Green

# Start fresh
Write-Host ""
Write-Host "Starting fresh database..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start containers" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database reset complete" -ForegroundColor Green

# Wait for database
Write-Host ""
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$healthStatus = docker inspect --format='{{.State.Health.Status}}' ticket-aggregator-db 2>$null
if ($healthStatus -eq "healthy") {
    Write-Host "✓ Database is healthy" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run: npx prisma db push" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host ""
