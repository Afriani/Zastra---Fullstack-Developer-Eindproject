-- Create media_db database and user
CREATE DATABASE media_db;
CREATE USER media_user WITH PASSWORD 'media_secret';
GRANT ALL PRIVILEGES ON DATABASE media_db TO media_user;

-- Create zastra_db database and user (if not exists)
CREATE DATABASE zastra_db;
CREATE USER zastra_user WITH PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE zastra_db TO zastra_user;