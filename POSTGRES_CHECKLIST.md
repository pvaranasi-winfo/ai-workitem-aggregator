# PostgreSQL Setup Checklist

## ✅ Complete Setup Checklist

### Prerequisites
- [ ] Node.js installed (v18+)
- [ ] Docker Desktop installed (for Docker option)
- [ ] OR PostgreSQL installed locally

### Files Created
- ✅ `database/docker-compose.yml` - Docker configuration
- ✅ `database/init-scripts/01-init.sql` - Database initialization
- ✅ `database/scripts/start-docker.ps1` - Start PostgreSQL
- ✅ `database/scripts/stop-docker.ps1` - Stop PostgreSQL
- ✅ `database/scripts/reset-database.ps1` - Reset database
- ✅ `database/scripts/backup-database.ps1` - Backup database
- ✅ `database/scripts/setup-local-postgres.ps1` - Local PostgreSQL setup
- ✅ `database/README.md` - Database documentation
- ✅ `setup-postgres.ps1` - Automated setup script
- ✅ `.env.postgres` - PostgreSQL environment template
- ✅ `MIGRATE_TO_POSTGRES.md` - Migration guide
- ✅ Updated `prisma/schema.prisma` - Now uses PostgreSQL

### Setup Options

#### Option 1: Automated Setup (Easiest)
```powershell
.\setup-postgres.ps1
```
- [ ] Run the script
- [ ] Choose Docker or Local PostgreSQL
- [ ] Script automatically configures everything
- [ ] Start application with `npm run dev`

#### Option 2: Docker PostgreSQL (Manual)
```powershell
cd database
.\scripts\start-docker.ps1
cd ..
npx prisma generate
npx prisma db push
npm run dev
```
- [ ] Start Docker container
- [ ] Initialize Prisma
- [ ] Push schema
- [ ] Start application

#### Option 3: Local PostgreSQL (Manual)
```powershell
cd database
.\scripts\setup-local-postgres.ps1
cd ..
# Update .env with your credentials
npx prisma generate
npx prisma db push
npm run dev
```
- [ ] Setup local database
- [ ] Configure .env
- [ ] Initialize Prisma
- [ ] Start application

### Database Management

#### Start Database (Docker)
```powershell
cd database
.\scripts\start-docker.ps1
```

#### Stop Database (Docker)
```powershell
cd database
.\scripts\stop-docker.ps1
```

#### Backup Database
```powershell
cd database
.\scripts\backup-database.ps1
```

#### Reset Database (WARNING: Deletes all data)
```powershell
cd database
.\scripts\reset-database.ps1
```

#### View Database (Prisma Studio)
```powershell
npx prisma studio
```

### Verification Steps

1. **Check Docker container is running:**
   ```powershell
   docker ps
   ```
   Should show `ticket-aggregator-db`

2. **Test database connection:**
   ```powershell
   docker exec ticket-aggregator-db pg_isready -U ticketuser
   ```
   Should return "accepting connections"

3. **Verify Prisma can connect:**
   ```powershell
   npx prisma db pull
   ```
   Should show successful connection

4. **Check application starts:**
   ```powershell
   npm run dev
   ```
   Should start without database errors

### Connection Details

#### Docker PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Database:** ticket_aggregator
- **Username:** ticketuser
- **Password:** ticketpass123
- **Connection String:**
  ```
  postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator
  ```

#### Production PostgreSQL
Use environment variables:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### Troubleshooting

#### Docker not starting
- [ ] Check if Docker Desktop is running
- [ ] Check if port 5432 is available: `netstat -ano | findstr :5432`
- [ ] View logs: `docker-compose logs -f`

#### Connection refused
- [ ] Verify DATABASE_URL in .env
- [ ] Check container status: `docker ps`
- [ ] Test connection: `docker exec -it ticket-aggregator-db psql -U ticketuser`

#### Schema push fails
- [ ] Verify database is running
- [ ] Check DATABASE_URL format
- [ ] Ensure user has proper permissions

### Additional Resources

- **Database Documentation:** `database/README.md`
- **Migration Guide:** `MIGRATE_TO_POSTGRES.md`
- **Docker Compose File:** `database/docker-compose.yml`
- **Main README:** `README.md`

### Next Steps After Setup

1. **Start the application:**
   ```powershell
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Add integrations:**
   - Enter your email
   - Click "Add Integration"
   - Select platform (Jira, GitHub, etc.)
   - Enter credentials
   - Click "Sync" to fetch tickets

4. **View your tickets:**
   - Dashboard shows all aggregated tickets
   - Filter by platform
   - Search by keywords
   - Click tickets to open in original platform

### Production Deployment

For production environments:
- [ ] Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
- [ ] Enable SSL connections
- [ ] Set strong passwords
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Use environment variables for all secrets
- [ ] Enable connection pooling

Example production DATABASE_URL:
```env
DATABASE_URL="postgresql://user:password@your-db.region.provider.com:5432/ticket_aggregator?sslmode=require&connection_limit=10"
```

---

## 🎉 You're All Set!

Your Ticket Aggregator now uses PostgreSQL and is ready for production use!

**Run the automated setup:**
```powershell
.\setup-postgres.ps1
```

**Or follow the manual steps above.**

For questions, see the documentation in the `database/` folder.
