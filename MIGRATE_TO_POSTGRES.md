# Quick Migration Guide: SQLite to PostgreSQL

This guide helps you migrate from SQLite to PostgreSQL.

## 🚀 Quick Start (Recommended)

Just run the setup script:
```powershell
.\setup-postgres.ps1
```

The script will:
1. Ask if you want Docker or local PostgreSQL
2. Set up the database automatically
3. Update your .env file
4. Initialize Prisma with PostgreSQL
5. Create the database schema

## 📋 Manual Setup

### Option 1: Docker PostgreSQL (Easiest)

1. **Start PostgreSQL:**
   ```powershell
   cd database
   .\scripts\start-docker.ps1
   ```

2. **Update .env:**
   ```env
   DATABASE_URL="postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator"
   ```

3. **Initialize Prisma:**
   ```powershell
   npx prisma generate
   npx prisma db push
   ```

4. **Start application:**
   ```powershell
   npm run dev
   ```

### Option 2: Local PostgreSQL

1. **Setup database:**
   ```powershell
   cd database
   .\scripts\setup-local-postgres.ps1
   ```

2. **Follow the prompts** to create database and user

3. **Update .env** with your connection string

4. **Initialize Prisma:**
   ```powershell
   npx prisma generate
   npx prisma db push
   ```

## 🔄 Migrating Existing Data

If you have data in SQLite that you want to migrate:

### Step 1: Export from SQLite
```powershell
# This will be available after you start with SQLite first
# For now, start fresh with PostgreSQL
```

### Step 2: Start with Fresh PostgreSQL
Since this is a new setup, you'll add integrations fresh in PostgreSQL.

## 🛠️ Troubleshooting

### "Connection refused"
- **Docker users:** Run `docker-compose ps` to check if container is running
- **Local users:** Verify PostgreSQL service is running

### "Password authentication failed"
- Check DATABASE_URL in .env matches your credentials
- For Docker: Use `ticketuser` / `ticketpass123`

### "Database does not exist"
- Run `.\database\scripts\start-docker.ps1` again
- Or manually create: `docker exec -it ticket-aggregator-db createdb -U ticketuser ticket_aggregator`

### Port 5432 in use
- Stop other PostgreSQL instances
- Or change port in `database/docker-compose.yml`

## 📊 Verifying Setup

### Check database is running:
```powershell
docker exec ticket-aggregator-db pg_isready -U ticketuser
```

### View database with Prisma Studio:
```powershell
npx prisma studio
```

### Connect with psql:
```powershell
docker exec -it ticket-aggregator-db psql -U ticketuser -d ticket_aggregator
```

## 🎯 What Changed

1. **Database Provider:**
   - Before: SQLite (`file:./dev.db`)
   - After: PostgreSQL (remote/container)

2. **Schema File:**
   - Updated `prisma/schema.prisma` to use PostgreSQL

3. **Data Types:**
   - All compatible - Prisma handles the differences

4. **Features Available:**
   - ✅ Better concurrent access
   - ✅ Production-ready
   - ✅ Full-text search
   - ✅ JSON queries
   - ✅ Scalable

## 📚 Next Steps

1. **Start the application:**
   ```powershell
   npm run dev
   ```

2. **Add your integrations** through the UI

3. **Your data is now in PostgreSQL!**

## 🔐 Security for Production

When deploying to production:

1. **Change database credentials**
2. **Use SSL connections:**
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```
3. **Use managed database** (AWS RDS, Azure, etc.)
4. **Enable backups**
5. **Set strong ENCRYPTION_KEY**

## 📖 Additional Resources

- Database folder: `./database/README.md`
- Docker Compose: `./database/docker-compose.yml`
- Scripts: `./database/scripts/`

---

**Need help? Check the troubleshooting section or the main README.md**
