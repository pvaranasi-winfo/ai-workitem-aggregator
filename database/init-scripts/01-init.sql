-- Initialize ticket_aggregator database
-- This script runs automatically when the PostgreSQL container starts

\c ticket_aggregator;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ticket_aggregator TO ticketuser;

-- Create initial schema (optional, Prisma will handle this)
-- This ensures the database is ready for Prisma migrations

-- Success message
SELECT 'Database initialized successfully!' as status;
