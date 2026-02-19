@echo off
REM Database Migration Helper Script for Windows
REM Run database migrations from the CLI

setlocal enabledelayedexpansion

echo MusicStream Database Migration Helper
echo ======================================

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found
    echo Please create .env with your Supabase credentials
    exit /b 1
)

REM Get migration file path
set MIGRATION_FILE=supabase\migrations\001_init_schema.sql

if not exist "%MIGRATION_FILE%" (
    echo Error: Migration file not found at %MIGRATION_FILE%
    exit /b 1
)

echo To apply migrations:
echo.
echo 1. Go to Supabase Console: https://app.supabase.com/
echo 2. Navigate to your project
echo 3. Go to SQL Editor
echo 4. Click 'New query'
echo 5. Copy and paste the contents of %MIGRATION_FILE%
echo 6. Click 'Run'
echo.
echo Alternatively, if you have psql installed:
echo psql -h db.PROJECT_REF.supabase.co -U postgres -d postgres < %MIGRATION_FILE%
echo.
echo Find your Project Ref in Supabase project settings
echo.
pause
