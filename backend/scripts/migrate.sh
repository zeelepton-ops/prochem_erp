#!/bin/bash
# Database migration runner for all platforms

set -e  # Exit on error

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-bmm_db}
DB_USER=${DB_USER:-bmm_user}
DB_PASSWORD=${DB_PASSWORD:-secure_password_here}

# Color output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}Connecting to database...${NC}"
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"

export PGPASSWORD=$DB_PASSWORD

# Run migration
echo -e "${CYAN}Running database migration...${NC}"
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -f database/migrations/001_initial_schema.sql

echo -e "${GREEN}✅ Database migration completed!${NC}"
echo -e "${YELLOW}Verify admin user:${NC}"
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -c "SELECT id, email, role FROM users WHERE email = 'admin@bmm.local';"

# Clear password
unset PGPASSWORD
