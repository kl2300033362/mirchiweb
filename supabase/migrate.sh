#!/bin/bash
# Database Migration Helper Script
# Run database migrations from the CLI

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MusicStream Database Migration Helper${NC}"
echo "========================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env with your Supabase credentials"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

# Check for required variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}Running migration...${NC}"
echo "Supabase URL: $VITE_SUPABASE_URL"

# Get the migration file
MIGRATION_FILE="supabase/migrations/001_init_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found at $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}To apply migrations manually:${NC}"
echo "1. Go to Supabase Console: https://app.supabase.com/"
echo "2. Navigate to your project"
echo "3. Go to SQL Editor"
echo "4. Click 'New query'"
echo "5. Copy and paste the contents of $MIGRATION_FILE"
echo "6. Click 'Run'"
echo ""
echo -e "${GREEN}Migration instructions displayed.${NC}"
echo ""
echo "Alternatively, if you have psql installed:"
echo "psql -h db.<project-ref>.supabase.co -U postgres -d postgres < $MIGRATION_FILE"
echo ""
echo -e "${YELLOW}Note: See .env for your Supabase credentials${NC}"
