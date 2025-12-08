# Complete Setup Script for PostgreSQL
# This script sets up everything needed to run the application with PostgreSQL

Write-Host "🚀 Ticket Aggregator - Complete PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Docker is installed and running
function Test-Docker {
    try {
        docker info > $null 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# Ask user for database preference
Write-Host "Choose your database setup option:" -ForegroundColor Yellow
Write-Host "1. Docker PostgreSQL (Recommended - Easy setup)" -ForegroundColor White
Write-Host "2. Local PostgreSQL (If you have PostgreSQL installed)" -ForegroundColor White
Write-Host "3. Skip database setup (I'll configure it manually)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

if ($choice -eq "3") {
    Write-Host ""
    Write-Host "Skipping database setup..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please configure DATABASE_URL in .env file manually" -ForegroundColor Cyan
    Write-Host "Example: DATABASE_URL=`"postgresql://user:pass@localhost:5432/ticket_aggregator`"" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Setup based on choice
if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Setting up Docker PostgreSQL..." -ForegroundColor Cyan
    Write-Host ""
    
    if (!(Test-Docker)) {
        Write-Host "✗ Docker is not running" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install and start Docker Desktop:" -ForegroundColor Yellow
        Write-Host "  https://www.docker.com/products/docker-desktop" -ForegroundColor White
        Write-Host ""
        Write-Host "After installing Docker, run this script again." -ForegroundColor Cyan
        exit 1
    }
    
    Write-Host "✓ Docker is running" -ForegroundColor Green
    Write-Host ""
    
    # Run Docker setup script
    & ".\database\scripts\start-docker.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Failed to start PostgreSQL with Docker" -ForegroundColor Red
        exit 1
    }
    
    # Update .env file
    $envContent = Get-Content .env -Raw
    $envContent = $envContent -replace 'DATABASE_URL="file:./dev.db"', 'DATABASE_URL="postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator"'
    $envContent | Set-Content .env
    
    Write-Host "✓ Updated .env file with PostgreSQL connection" -ForegroundColor Green
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "Setting up Local PostgreSQL..." -ForegroundColor Cyan
    Write-Host ""
    
    # Run local PostgreSQL setup
    & ".\database\scripts\setup-local-postgres.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Local PostgreSQL setup failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "⚠ Please update the DATABASE_URL in .env file with your credentials" -ForegroundColor Yellow
    $continue = Read-Host "Press Enter when you've updated the .env file..."
    
} else {
    Write-Host ""
    Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host ""
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prisma client generated" -ForegroundColor Green

# Push database schema
Write-Host ""
Write-Host "📊 Creating database schema..." -ForegroundColor Cyan
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to push database schema" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Verify DATABASE_URL in .env is correct" -ForegroundColor White
    Write-Host "- Ensure PostgreSQL is running" -ForegroundColor White
    Write-Host "- Check database credentials" -ForegroundColor White
    exit 1
}

Write-Host "✓ Database schema created" -ForegroundColor Green

# Success!
Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Ticket Aggregator is ready to use with PostgreSQL!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database Management:" -ForegroundColor Yellow
Write-Host "- View data: npx prisma studio" -ForegroundColor White
Write-Host "- Backup: .\database\scripts\backup-database.ps1" -ForegroundColor White
Write-Host "- Stop DB: .\database\scripts\stop-docker.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more info, see: .\database\README.md" -ForegroundColor Gray
Write-Host ""
