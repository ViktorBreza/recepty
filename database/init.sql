-- Database initialization script for Kitkuhar
-- This file will be executed when the database is first created

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'Europe/Kiev';

-- Basic configuration
ALTER DATABASE kitkuhar SET timezone TO 'Europe/Kiev';

-- Grant privileges to application user
GRANT ALL PRIVILEGES ON DATABASE kitkuhar TO kitkuhar_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO kitkuhar_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kitkuhar_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kitkuhar_user;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kitkuhar_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kitkuhar_user;