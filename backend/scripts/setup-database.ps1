# PostgreSQL Setup Script for Windows
# Run as Administrator

$dbHost = "localhost"
$dbPort = 5432
$dbName = "bmm_db"
$dbUser = "bmm_user"
$dbPassword = "secure_password_here"
$postgresPassword = Read-Host "Enter PostgreSQL 'postgres' user password"

# Set password environment variable
$env:PGPASSWORD = $postgresPassword

Write-Host "Setting up PostgreSQL database..." -ForegroundColor Green

# Create user
Write-Host "Creating database user..." -ForegroundColor Cyan
psql -U postgres -h $dbHost -p $dbPort -c "CREATE USER $dbUser WITH PASSWORD '$dbPassword';"

# Create database
Write-Host "Creating database..." -ForegroundColor Cyan
psql -U postgres -h $dbHost -p $dbPort -c "CREATE DATABASE $dbName OWNER $dbUser;"

# Grant privileges
Write-Host "Granting privileges..." -ForegroundColor Cyan
psql -U postgres -h $dbHost -p $dbPort -c "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;"

# Enable required extensions
Write-Host "Enabling extensions..." -ForegroundColor Cyan
psql -U $dbUser -d $dbName -h $dbHost -p $dbPort -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
psql -U $dbUser -d $dbName -h $dbHost -p $dbPort -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "Now run: npm run db:migrate" -ForegroundColor Yellow

# Clear password
$env:PGPASSWORD = ""
