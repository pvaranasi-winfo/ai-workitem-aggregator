# PostgreSQL Database Setup for Ticket Aggregator

This folder contains all PostgreSQL database configuration and setup scripts.

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **PowerShell** or **Command Prompt**
- **Port 5432** available (default PostgreSQL port)

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start the PostgreSQL database:**
   ```powershell
   cd database
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```powershell
   docker-compose ps
   ```

3. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator"
   ```

4. **Initialize Prisma with PostgreSQL:**
   ```powershell
   cd ..
   npx prisma generate
   npx prisma db push
   ```

5. **Start the application:**
   ```powershell
   npm run dev
   ```

### Option 2: Using Local PostgreSQL Installation

If you have PostgreSQL installed locally:

1. **Create the database:**
   ```powershell
   .\database\scripts\setup-local-postgres.ps1
   ```

2. **Update your `.env` file with your credentials:**
   ```env
   DATABASE_URL="postgresql://your_user:your_password@localhost:5432/ticket_aggregator"
   ```

3. **Initialize Prisma:**
   ```powershell
   npx prisma generate
   npx prisma db push
   ```

## 📁 Folder Structure

```
database/
├── docker-compose.yml          # Docker Compose configuration
├── init-scripts/               # Database initialization scripts
│   └── 01-init.sql            # Initial database setup
├── scripts/                    # Helper scripts
│   ├── setup-local-postgres.ps1
│   ├── start-docker.ps1
│   ├── stop-docker.ps1
│   ├── reset-database.ps1
│   └── backup-database.ps1
└── README.md                   # This file
```

## 🔧 Database Configuration

### Docker Configuration
- **Container Name:** ticket-aggregator-db
- **Database Name:** ticket_aggregator
- **Username:** ticketuser
- **Password:** ticketpass123
- **Port:** 5432
- **Volume:** postgres_data (persistent storage)

### Connection String
```
postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator
```

## 📝 Available Scripts

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

### Reset Database
```powershell
cd database
.\scripts\reset-database.ps1
```

### Backup Database
```powershell
cd database
.\scripts\backup-database.ps1
```

### View Database Logs
```powershell
cd database
docker-compose logs -f postgres
```

## 🔍 Database Management Tools

### Using Prisma Studio
```powershell
npx prisma studio
```

### Using pgAdmin (Docker)
Add to `docker-compose.yml`:
```yaml
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
```

### Using psql (Command Line)
```powershell
docker exec -it ticket-aggregator-db psql -U ticketuser -d ticket_aggregator
```

## 🛠️ Troubleshooting

### Port 5432 Already in Use
```powershell
# Check what's using the port
netstat -ano | findstr :5432

# Stop the process or change the port in docker-compose.yml
```

### Container Won't Start
```powershell
# View logs
docker-compose logs postgres

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Connection Refused
```powershell
# Check if container is running
docker-compose ps

# Verify health status
docker exec ticket-aggregator-db pg_isready -U ticketuser
```

### Reset Everything
```powershell
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Reinitialize Prisma
npx prisma generate
npx prisma db push
```

## 📊 Database Schema

The schema is managed by Prisma. See `prisma/schema.prisma` for the complete schema definition.

### Main Tables:
- **User** - User accounts (identified by email)
- **Integration** - Platform integrations with encrypted tokens
- **Ticket** - Aggregated tickets from all platforms

## 🔐 Security Notes

- **Change default passwords** in production
- Use **environment variables** for sensitive data
- Enable **SSL connections** for production databases
- Regularly **backup** your database
- Keep Docker and PostgreSQL **updated**

## 🌐 Production Deployment

For production, consider:
- **Managed PostgreSQL** (AWS RDS, Azure Database, Google Cloud SQL)
- **Connection pooling** (PgBouncer)
- **SSL/TLS encryption**
- **Regular backups**
- **Monitoring and alerts**

Example production connection string:
```env
DATABASE_URL="postgresql://user:password@your-db-host.region.provider.com:5432/ticket_aggregator?sslmode=require"
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)

---

**Need help? Check the main README.md or open an issue.**
