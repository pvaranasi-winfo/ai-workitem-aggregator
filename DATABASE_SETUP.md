# 🎯 Complete PostgreSQL Setup - Quick Start

## ⚡ Super Quick Start (One Command)

```powershell
.\setup-postgres.ps1
```

This single script does everything automatically!

---

## 📚 What Was Created

Your `database/` folder now contains:

```
database/
├── docker-compose.yml                    # Docker PostgreSQL config
├── init-scripts/
│   └── 01-init.sql                      # Database initialization
├── scripts/
│   ├── start-docker.ps1                 # Start PostgreSQL container
│   ├── stop-docker.ps1                  # Stop PostgreSQL container
│   ├── reset-database.ps1               # Reset database (delete all data)
│   ├── backup-database.ps1              # Create database backup
│   └── setup-local-postgres.ps1         # Setup local PostgreSQL
└── README.md                             # Full documentation
```

Additional files in root:
- `setup-postgres.ps1` - Automated complete setup
- `.env.postgres` - PostgreSQL environment template
- `MIGRATE_TO_POSTGRES.md` - Migration guide
- `POSTGRES_CHECKLIST.md` - Setup checklist

---

## 🚀 Three Ways to Use PostgreSQL

### 1. Docker PostgreSQL (Recommended - Zero Config)

**Automated:**
```powershell
.\setup-postgres.ps1
# Choose option 1 when prompted
```

**Manual:**
```powershell
# Start database
cd database
.\scripts\start-docker.ps1

# The script will output the connection string
# It's automatically configured as:
# postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator
```

**What you get:**
- PostgreSQL 16 in Docker container
- Pre-configured credentials
- Automatic health checks
- Persistent data storage
- One command to start/stop

### 2. Local PostgreSQL (If Already Installed)

```powershell
.\setup-postgres.ps1
# Choose option 2 when prompted
```

Or manually:
```powershell
cd database
.\scripts\setup-local-postgres.ps1
```

### 3. Keep Using SQLite (Development Only)

No changes needed - the app still works with SQLite if you prefer:
```env
DATABASE_URL="file:./dev.db"
```

---

## 🎮 Database Management Commands

### Start Database (Docker)
```powershell
cd database
.\scripts\start-docker.ps1
```

### Stop Database (Docker)
```powershell
cd database
.\scripts\stop-docker.ps1
```

### Backup Database
```powershell
cd database
.\scripts\backup-database.ps1
# Creates timestamped backup in database/backups/
```

### Reset Database (⚠️ Deletes all data)
```powershell
cd database
.\scripts\reset-database.ps1
# You'll be asked to confirm
```

### View Database with GUI
```powershell
npx prisma studio
# Opens at http://localhost:5555
```

### Connect with psql
```powershell
docker exec -it ticket-aggregator-db psql -U ticketuser -d ticket_aggregator
```

---

## ✅ Quick Verification

**Check if PostgreSQL is running:**
```powershell
docker ps
# Should show: ticket-aggregator-db
```

**Test connection:**
```powershell
docker exec ticket-aggregator-db pg_isready -U ticketuser
# Should output: accepting connections
```

**View logs:**
```powershell
cd database
docker-compose logs -f postgres
```

---

## 🔧 Configuration Details

### Docker Setup
- **Container:** ticket-aggregator-db
- **Image:** postgres:16-alpine
- **Port:** 5432
- **Database:** ticket_aggregator
- **User:** ticketuser
- **Password:** ticketpass123

### Connection String
```
postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator
```

### .env Configuration
```env
DATABASE_URL="postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENCRYPTION_KEY="your-secret-key"
```

---

## 🎯 Complete Workflow

### First Time Setup
```powershell
# 1. Run automated setup
.\setup-postgres.ps1

# 2. Start application
npm run dev

# 3. Open browser
# http://localhost:3000
```

### Daily Usage
```powershell
# Start database (if not running)
cd database
.\scripts\start-docker.ps1
cd ..

# Start application
npm run dev
```

### Stopping Everything
```powershell
# Stop application: Ctrl+C in terminal

# Stop database
cd database
.\scripts\stop-docker.ps1
```

---

## 🔍 Troubleshooting

### "Docker is not running"
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Run setup again

### "Port 5432 already in use"
```powershell
# Find what's using it
netstat -ano | findstr :5432

# Stop the other PostgreSQL, or change port in docker-compose.yml
```

### "Connection refused"
```powershell
# Check if container is running
docker ps

# Check container logs
docker-compose logs postgres

# Restart container
cd database
.\scripts\stop-docker.ps1
.\scripts\start-docker.ps1
```

### "Schema push failed"
```powershell
# Verify DATABASE_URL in .env
# Should be: postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator

# Regenerate Prisma client
npx prisma generate

# Try push again
npx prisma db push
```

### Reset Everything
```powershell
# Nuclear option - deletes all data and starts fresh
cd database
.\scripts\reset-database.ps1
cd ..

npx prisma db push
npm run dev
```

---

## 📖 Documentation

- **Full Database Guide:** `database/README.md`
- **Migration Guide:** `MIGRATE_TO_POSTGRES.md`
- **Setup Checklist:** `POSTGRES_CHECKLIST.md`
- **Main README:** `README.md`

---

## 🚀 Production Deployment

For production, use managed PostgreSQL:

**AWS RDS:**
```env
DATABASE_URL="postgresql://user:pass@dbname.region.rds.amazonaws.com:5432/ticket_aggregator?sslmode=require"
```

**Azure Database:**
```env
DATABASE_URL="postgresql://user@server:pass@servername.postgres.database.azure.com:5432/ticket_aggregator?sslmode=require"
```

**Google Cloud SQL:**
```env
DATABASE_URL="postgresql://user:pass@/ticket_aggregator?host=/cloudsql/project:region:instance"
```

**Important for production:**
- ✅ Change default passwords
- ✅ Enable SSL/TLS
- ✅ Set up automated backups
- ✅ Configure monitoring
- ✅ Use connection pooling
- ✅ Set firewall rules

---

## 🎉 You're Ready!

**Your PostgreSQL database is fully configured and ready to use!**

### Next Steps:
1. Database is running ✅
2. Schema is created ✅
3. Application is connected ✅

**Just run:**
```powershell
npm run dev
```

**And visit:**
```
http://localhost:3000
```

---

**Need Help?**
- Check `database/README.md` for detailed documentation
- See `POSTGRES_CHECKLIST.md` for complete checklist
- Review scripts in `database/scripts/` folder

**Everything is automated and ready to go! 🚀**
