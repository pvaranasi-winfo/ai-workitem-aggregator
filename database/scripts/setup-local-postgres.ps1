# Setup Local PostgreSQL Database
# For users who have PostgreSQL installed locally (not using Docker)

Write-Host "🐘 Setting up Local PostgreSQL Database..." -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL not found"
    }
    Write-Host "✓ PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    Write-Host "  Or use Docker: .\scripts\start-docker.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Please provide your PostgreSQL credentials:" -ForegroundColor Cyan

$pgUser = Read-Host "PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($pgUser)) {
    $pgUser = "postgres"
}

$pgHost = Read-Host "PostgreSQL host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($pgHost)) {
    $pgHost = "localhost"
}

$pgPort = Read-Host "PostgreSQL port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($pgPort)) {
    $pgPort = "5432"
}

Write-Host ""
Write-Host "Creating database 'ticket_aggregator'..." -ForegroundColor Yellow

# Create database
$env:PGPASSWORD = Read-Host "PostgreSQL password" -AsSecureString
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:PGPASSWORD))

psql -U $pgUser -h $pgHost -p $pgPort -c "CREATE DATABASE ticket_aggregator;" postgres 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Database might already exist (continuing...)" -ForegroundColor Yellow
}

# Create user (optional)
Write-Host ""
$createUser = Read-Host "Create dedicated user 'ticketuser'? (yes/no)"
if ($createUser -eq "yes") {
    psql -U $pgUser -h $pgHost -p $pgPort -c "CREATE USER ticketuser WITH PASSWORD 'ticketpass123';" postgres 2>$null
    psql -U $pgUser -h $pgHost -p $pgPort -c "GRANT ALL PRIVILEGES ON DATABASE ticket_aggregator TO ticketuser;" postgres 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ User created and permissions granted" -ForegroundColor Green
        $finalUser = "ticketuser"
        $finalPass = "ticketpass123"
    } else {
        Write-Host "⚠ User creation skipped" -ForegroundColor Yellow
        $finalUser = $pgUser
        $finalPass = "your_password"
    }
} else {
    $finalUser = $pgUser
    $finalPass = "your_password"
}

Write-Host ""
Write-Host "✓ Database Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Update your .env file with:" -ForegroundColor Cyan
Write-Host "DATABASE_URL=`"postgresql://${finalUser}:${finalPass}@${pgHost}:${pgPort}/ticket_aggregator`"" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update DATABASE_URL in .env file" -ForegroundColor White
Write-Host "2. Run: npx prisma generate" -ForegroundColor White
Write-Host "3. Run: npx prisma db push" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
