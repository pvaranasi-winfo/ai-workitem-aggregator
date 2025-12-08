# Backup PostgreSQL Database

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backup_$timestamp.sql"
$backupPath = Join-Path (Get-Location) "backups"

Write-Host "💾 Creating Database Backup..." -ForegroundColor Cyan
Write-Host ""

# Create backups directory if it doesn't exist
if (!(Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath | Out-Null
    Write-Host "✓ Created backups directory" -ForegroundColor Green
}

# Check if container is running
$containerStatus = docker inspect --format='{{.State.Running}}' ticket-aggregator-db 2>$null

if ($containerStatus -ne "true") {
    Write-Host "✗ Database container is not running" -ForegroundColor Red
    Write-Host "  Start it with: .\scripts\start-docker.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating backup: $backupFile" -ForegroundColor Yellow

# Create backup
$backupFullPath = Join-Path $backupPath $backupFile
docker exec ticket-aggregator-db pg_dump -U ticketuser -d ticket_aggregator > $backupFullPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backup created successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backup location:" -ForegroundColor Cyan
    Write-Host "  $backupFullPath" -ForegroundColor White
    
    $fileSize = (Get-Item $backupFullPath).Length / 1KB
    Write-Host "  Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor White
} else {
    Write-Host "✗ Backup failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "To restore this backup:" -ForegroundColor Cyan
Write-Host "  docker exec -i ticket-aggregator-db psql -U ticketuser -d ticket_aggregator < $backupFullPath" -ForegroundColor Yellow
Write-Host ""
