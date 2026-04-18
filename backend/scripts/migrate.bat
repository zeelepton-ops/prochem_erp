@echo off
REM Database migration runner for Windows

setlocal enabledelayedexpansion

set DB_HOST=%DB_HOST:localhost=localhost%
set DB_PORT=%DB_PORT:5432=5432%
set DB_NAME=%DB_NAME:bmm_db=bmm_db%
set DB_USER=%DB_USER:bmm_user=bmm_user%
set DB_PASSWORD=%DB_PASSWORD:secure_password_here=secure_password_here%

echo Connecting to database...
echo Host: %DB_HOST%:%DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%

set PGPASSWORD=%DB_PASSWORD%

echo Running database migration...
psql -U %DB_USER% -d %DB_NAME% -h %DB_HOST% -p %DB_PORT% -f database\migrations\001_initial_schema.sql

if errorlevel 1 (
    echo Error: Database migration failed!
    set PGPASSWORD=
    exit /b 1
)

echo.
echo ✅ Database migration completed!
echo.
echo Verifying admin user...
psql -U %DB_USER% -d %DB_NAME% -h %DB_HOST% -p %DB_PORT% -c "SELECT id, email, role FROM users WHERE email = 'admin@bmm.local';"

set PGPASSWORD=
endlocal
