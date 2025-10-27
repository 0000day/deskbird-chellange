-- Initial database setup
-- This file is automatically executed when the container starts for the first time

-- Create database if not exists (redundant with POSTGRES_DB but good practice)
SELECT 'CREATE DATABASE deskbird_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'deskbird_dev')\gexec

-- You can add additional setup SQL here if needed