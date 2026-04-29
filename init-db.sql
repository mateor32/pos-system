-- POS System Database Initialization Script
-- Run as PostgreSQL superuser (postgres)

-- Create database
CREATE DATABASE pos_db;

-- Create user
CREATE USER pos_user WITH PASSWORD 'pos_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pos_db TO pos_user;

-- Connect to pos_db and grant schema privileges
\c pos_db

GRANT ALL ON SCHEMA public TO pos_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pos_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pos_user;
