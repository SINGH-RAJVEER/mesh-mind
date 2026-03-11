#!/usr/bin/env bash

# Vector Embeddings Health Check Script
# This script verifies that all components for vector embeddings are working

set -euo pipefail

echo "========================================="
echo "  MeshMind Vector Embeddings Check"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_CONTAINER="${API_CONTAINER:-meshmind-api}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-meshmind-postgres}"
API_URL="${API_URL:-http://localhost:8000/health}"

if ! command -v docker > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} docker is not installed"
    exit 1
fi

get_container_env() {
    local container="$1"
    local variable="$2"

    docker exec "$container" printenv "$variable" 2>/dev/null || true
}

POSTGRES_DB="$(get_container_env "$API_CONTAINER" POSTGRES_DB)"
POSTGRES_DB="${POSTGRES_DB:-meshmind}"
POSTGRES_USER="$(get_container_env "$API_CONTAINER" POSTGRES_USER)"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_HOST="$(get_container_env "$API_CONTAINER" POSTGRES_HOST)"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
LLM_BASE_URL="$(get_container_env "$API_CONTAINER" LLM_BASE_URL)"
LLM_EMBEDDING_MODEL="$(get_container_env "$API_CONTAINER" LLM_EMBEDDING_MODEL)"
LEGACY_EMBEDDING_MODEL="$(get_container_env "$API_CONTAINER" EMBEDDING_MODEL)"

# Check if docker-compose is running
echo "1. Checking Docker services..."
if docker ps --format '{{.Names}}' | grep -qx "$POSTGRES_CONTAINER"; then
    echo -e "${GREEN}✓${NC} PostgreSQL container is running"
else
    echo -e "${RED}✗${NC} PostgreSQL container is not running"
    echo "   Run: docker compose -f docker/dev/docker-compose.dev.yml up -d postgres"
    exit 1
fi

if docker ps --format '{{.Names}}' | grep -qx "$API_CONTAINER"; then
    echo -e "${GREEN}✓${NC} API container is running"
else
    echo -e "${RED}✗${NC} API container is not running"
    echo "   Run: docker compose -f docker/dev/docker-compose.dev.yml up -d api"
    exit 1
fi

echo ""

# Check PostgreSQL health
echo "2. Checking PostgreSQL connection..."
if docker exec "$POSTGRES_CONTAINER" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL is ready"
else
    echo -e "${RED}✗${NC} PostgreSQL is not ready"
    exit 1
fi

echo ""

# Check if pgvector extension is installed
echo "3. Checking pgvector extension..."
PGVECTOR_CHECK=$(docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT extname FROM pg_extension WHERE extname = 'vector';" 2>/dev/null | xargs)

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
TABLE_CHECK=$(docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'message_embeddings';" 2>/dev/null | xargs)

if [ "$TABLE_CHECK" == "message_embeddings" ]; then
    echo -e "${GREEN}✓${NC} message_embeddings table exists"
    
    # Get row count
    ROW_COUNT=$(docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM message_embeddings;" 2>/dev/null | xargs)
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
    API_HEALTH=$(curl -s "$API_URL" 2>/dev/null || echo "failed")
    
    if echo "$API_HEALTH" | grep -q '"status"'; then
        echo -e "${GREEN}✓${NC} API is responding"
        echo "$API_HEALTH" | jq '.' 2>/dev/null || echo "$API_HEALTH"

        if echo "$API_HEALTH" | grep -q '"postgresql":"connected"'; then
            echo -e "${GREEN}✓${NC} API reports PostgreSQL connectivity"
        else
            echo -e "${RED}✗${NC} API does not report PostgreSQL connectivity"
            exit 1
        fi
    else
        echo -e "${RED}✗${NC} API health check failed"
        echo "   Response: $API_HEALTH"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not installed, skipping API check"
fi

echo ""

# Check LiteLLM endpoint
echo "6. Checking LiteLLM embeddings endpoint..."
if [ -n "${LLM_BASE_URL:-}" ]; then
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
)

MISSING_VARS=()

for VAR in "${ENV_VARS[@]}"; do
    if docker exec "$API_CONTAINER" printenv "$VAR" > /dev/null 2>&1; then
        VALUE=$(docker exec "$API_CONTAINER" printenv "$VAR" 2>/dev/null)
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

if [ -n "$LLM_EMBEDDING_MODEL" ]; then
    echo -e "${GREEN}✓${NC} LLM_EMBEDDING_MODEL=$LLM_EMBEDDING_MODEL"
elif [ -n "$LEGACY_EMBEDDING_MODEL" ]; then
    echo -e "${YELLOW}⚠${NC} EMBEDDING_MODEL=$LEGACY_EMBEDDING_MODEL"
    echo "   Prefer LLM_EMBEDDING_MODEL for consistency with the API configuration."
else
    echo -e "${GREEN}✓${NC} LLM_EMBEDDING_MODEL is using the API default (text-embedding-004)"
fi

echo ""
echo "8. Checking Docker-safe database host..."
if [ "$POSTGRES_HOST" = "localhost" ] || [ "$POSTGRES_HOST" = "127.0.0.1" ] || [ "$POSTGRES_HOST" = "::1" ]; then
    echo -e "${YELLOW}⚠${NC} API container env uses POSTGRES_HOST=$POSTGRES_HOST"
    echo "   Runtime host rewriting should still target the Docker service name 'postgres'."
else
    echo -e "${GREEN}✓${NC} API container env uses POSTGRES_HOST=$POSTGRES_HOST"
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠${NC} Missing environment variables: ${MISSING_VARS[*]}"
    echo "   Add them to your .env file and restart: docker compose -f docker/dev/docker-compose.dev.yml up -d api"
fi

echo ""
echo "========================================="
echo "  Summary"
echo "========================================="

# Overall status
if [ ${#MISSING_VARS[@]} -eq 0 ] && \
    docker ps --format '{{.Names}}' | grep -qx "$POSTGRES_CONTAINER" && \
    docker ps --format '{{.Names}}' | grep -qx "$API_CONTAINER" && \
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
