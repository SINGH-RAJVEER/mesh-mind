#!/usr/bin/env bash

# Vector Embeddings Health Check Script
# This script verifies that all components for vector embeddings are working

set -e

echo "========================================="
echo "  MindScribe Vector Embeddings Check"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose is running
echo "1. Checking Docker services..."
if docker ps | grep -q mindscribe-postgres; then
    echo -e "${GREEN}✓${NC} PostgreSQL container is running"
else
    echo -e "${RED}✗${NC} PostgreSQL container is not running"
    echo "   Run: docker-compose up -d postgres"
    exit 1
fi

if docker ps | grep -q mindscribe-api; then
    echo -e "${GREEN}✓${NC} API container is running"
else
    echo -e "${RED}✗${NC} API container is not running"
    echo "   Run: docker-compose up -d api"
    exit 1
fi

echo ""

# Check PostgreSQL health
echo "2. Checking PostgreSQL connection..."
if docker exec mindscribe-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL is ready"
else
    echo -e "${RED}✗${NC} PostgreSQL is not ready"
    exit 1
fi

echo ""

# Check if pgvector extension is installed
echo "3. Checking pgvector extension..."
PGVECTOR_CHECK=$(docker exec mindscribe-postgres psql -U postgres -d mindscribe_vectors -t -c "SELECT extname FROM pg_extension WHERE extname = 'vector';" 2>/dev/null | xargs)

if [ "$PGVECTOR_CHECK" == "vector" ]; then
    echo -e "${GREEN}✓${NC} pgvector extension is installed"
else
    echo -e "${RED}✗${NC} pgvector extension is not installed"
    echo "   The database might need initialization"
    exit 1
fi

echo ""

# Check if message_embeddings table exists
echo "4. Checking message_embeddings table..."
TABLE_CHECK=$(docker exec mindscribe-postgres psql -U postgres -d mindscribe_vectors -t -c "SELECT tablename FROM pg_tables WHERE tablename = 'message_embeddings';" 2>/dev/null | xargs)

if [ "$TABLE_CHECK" == "message_embeddings" ]; then
    echo -e "${GREEN}✓${NC} message_embeddings table exists"
    
    # Get row count
    ROW_COUNT=$(docker exec mindscribe-postgres psql -U postgres -d mindscribe_vectors -t -c "SELECT COUNT(*) FROM message_embeddings;" 2>/dev/null | xargs)
    echo "   Current embeddings: $ROW_COUNT"
else
    echo -e "${RED}✗${NC} message_embeddings table does not exist"
    echo "   Run the init script or check database initialization"
    exit 1
fi

echo ""

# Check API health endpoint
echo "5. Checking API health endpoint..."
if command -v curl > /dev/null 2>&1; then
    API_HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null || echo "failed")
    
    if echo "$API_HEALTH" | grep -q "healthy\|degraded"; then
        echo -e "${GREEN}✓${NC} API is responding"
        echo "$API_HEALTH" | jq '.' 2>/dev/null || echo "$API_HEALTH"
    else
        echo -e "${RED}✗${NC} API health check failed"
        echo "   Response: $API_HEALTH"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not installed, skipping API check"
fi

echo ""

# Check LiteLLM endpoint
echo "6. Checking LiteLLM embeddings endpoint..."
if [ -n "$LLM_BASE_URL" ]; then
    BASE_URL="$LLM_BASE_URL"
else
    BASE_URL="http://localhost:8000/v1"
fi

if command -v curl > /dev/null 2>&1; then
    # Try to get models list
    LITELLM_CHECK=$(curl -s "${BASE_URL}/models" 2>/dev/null || echo "failed")
    
    if echo "$LITELLM_CHECK" | grep -q "text-embedding"; then
        echo -e "${GREEN}✓${NC} LiteLLM is responding with embedding models"
    elif echo "$LITELLM_CHECK" | grep -q "data"; then
        echo -e "${YELLOW}⚠${NC} LiteLLM is responding but embedding model not confirmed"
        echo "   Make sure text-embedding-004 is configured"
    else
        echo -e "${RED}✗${NC} LiteLLM is not responding correctly"
        echo "   Make sure LiteLLM proxy is running at: $BASE_URL"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not installed, skipping LiteLLM check"
fi

echo ""

# Check environment variables
echo "7. Checking environment variables..."
ENV_VARS=(
    "POSTGRES_HOST"
    "POSTGRES_DB"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "LLM_EMBEDDING_MODEL"
)

MISSING_VARS=()

for VAR in "${ENV_VARS[@]}"; do
    if docker exec mindscribe-api printenv "$VAR" > /dev/null 2>&1; then
        VALUE=$(docker exec mindscribe-api printenv "$VAR" 2>/dev/null)
        if [ "$VAR" == "POSTGRES_PASSWORD" ]; then
            echo -e "${GREEN}✓${NC} $VAR is set (value hidden)"
        else
            echo -e "${GREEN}✓${NC} $VAR=$VALUE"
        fi
    else
        echo -e "${RED}✗${NC} $VAR is not set"
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠${NC} Missing environment variables: ${MISSING_VARS[*]}"
    echo "   Add them to your .env file and restart: docker-compose up -d api"
fi

echo ""
echo "========================================="
echo "  Summary"
echo "========================================="

# Overall status
if [ ${#MISSING_VARS[@]} -eq 0 ] && \
   docker ps | grep -q mindscribe-postgres && \
   docker ps | grep -q mindscribe-api && \
   [ "$PGVECTOR_CHECK" == "vector" ] && \
   [ "$TABLE_CHECK" == "message_embeddings" ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Vector embeddings are ready to use."
    echo "Send a chat message to test embedding generation."
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above and try again."
    exit 1
fi

echo ""
