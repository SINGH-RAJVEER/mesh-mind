# Docker Setup Guide

This guide covers the Docker configuration for the MindScribe application, including Docker Compose orchestration, multi-stage builds, and production-ready configurations.

## Project Structure

```
docker/
├── Dockerfile.api          # Backend API service build
├── Dockerfile.web          # Frontend web service build
├── nginx.conf             # Nginx configuration for web server
└── .env.example           # Environment variables template

apps/
├── api/
│   └── .dockerignore      # Excludes unnecessary files from API image
└── web/
    └── .dockerignore      # Excludes unnecessary files from web image

packages/
├── database/
│   └── .dockerignore      # Excludes unnecessary files from database package
└── types/
    └── .dockerignore      # Excludes unnecessary files from types package

docker-compose.yml          # Orchestrates all services
```

## Quick Start

### 1. Setup Environment

```bash
# Copy the example environment file and configure it
cp docker/.env.example .env

# Edit .env with your actual values
nano .env
```

Required environment variables:

- `MONGO_INITDB_ROOT_USERNAME` - MongoDB root user
- `MONGO_INITDB_ROOT_PASSWORD` - MongoDB root password
- `SECRET_KEY` - JWT secret for API
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials
- `VITE_GOOGLE_CLIENT_ID` & `VITE_GITHUB_CLIENT_ID` - Frontend OAuth IDs

### 2. Start Services

```bash
# Build and start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f mongo
```

### 3. Access Services

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **MongoDB**: mongodb://localhost:27017 (with credentials from .env)

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (caution: deletes data)
docker-compose down -v
```

## Service Architecture

### MongoDB Service

- **Image**: mongo:7.0 (official MongoDB)
- **Port**: 27017
- **Volumes**:
  - `mongo_data` - Data persistence
  - `mongo_config` - Configuration persistence
- **Health Check**: MongoDB ping command
- **Init**: Creates root user with credentials from .env

### API Service

- **Build**: Multi-stage Dockerfile
- **Base Image**: oven/bun:1.3.9 (builder) → node:22-alpine (production)
- **Port**: 8000
- **Dependencies**: MongoDB
- **Health Check**: HTTP GET /health endpoint
- **Non-root User**: nodejs (uid: 1001)
- **Features**:
  - TypeScript compilation
  - Production-only dependencies
  - Dumb-init process manager
  - Volume mounting for hot reload in dev

### Web Service

- **Build**: Multi-stage Dockerfile
- **Base Image**: oven/bun:1.3.9 (builder) → nginx:alpine (production)
- **Port**: 3000
- **Dependencies**: API service
- **Health Check**: HTTP GET / endpoint
- **Non-root User**: nginx-user (uid: 1001)
- **Features**:
  - Vite production build
  - Nginx reverse proxy
  - Gzip compression enabled
  - Cache busting for HTML
  - API proxying to `/api/` path

## Docker Networking

All services connect via `mindscribe-network` (bridge network):

- Services communicate by container name (e.g., `mongo`, `api`)
- Isolated from host unless ports are exposed
- Easy service discovery

## Environment Configuration

### Development (.env.local)

```bash
NODE_ENV=development
VITE_API_URL=http://localhost:8000
MONGODB_URI=mongodb://mindscribe:password@mongo:27017/mindscribe
```

### Production (.env)

```bash
NODE_ENV=production
VITE_API_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mindscribe
```

## Building Images Separately

### Build API Image Only

```bash
docker build -f docker/Dockerfile.api -t mindscribe-api:latest .
```

### Build Web Image Only

```bash
docker build -f docker/Dockerfile.web -t mindscribe-web:latest .
```

### Run Built Images

```bash
# Run API
docker run -p 8000:8000 \
  -e MONGODB_URI=mongodb://mongo:27017/mindscribe \
  mindscribe-api:latest

# Run Web
docker run -p 3000:80 \
  mindscribe-web:latest
```

## Docker Ignore Files

Each app and package has a `.dockerignore` file that excludes:

- `node_modules` - Dependencies (reinstalled in container)
- `.git` - Version control
- `.env.local` - Local configs (use .env)
- `*.log` - Log files
- `coverage` - Test coverage reports
- `dist`, `build` - Build artifacts
- `.turbo` - Monorepo cache

This reduces image size and build time by ~70%.

## Dockerfile Explanations

### Dockerfile.api (Multi-stage)

**Stage 1: Builder**

```dockerfile
FROM oven/bun:1.3.9 AS builder
# Install all dependencies
# Copy source code
# Compile TypeScript to JavaScript
# Result: /app/apps/api/dist with compiled code
```

**Stage 2: Production**

```dockerfile
FROM node:22-alpine
# Copy only compiled code from builder
# Install production dependencies with npm (smaller than bun)
# Create non-root user
# Expose port 8000
# Use dumb-init for signal handling
```

**Why multi-stage?**

- Builder stage: ~1.5GB (with bun and build tools)
- Production stage: ~200MB (only runtime)
- Final image: ~350-400MB (with dependencies)

### Dockerfile.web (Multi-stage)

**Stage 1: Builder**

```dockerfile
FROM oven/bun:1.3.9 AS builder
# Install dependencies
# Compile Vite app to static files
# Result: /app/apps/web/dist with HTML, CSS, JS, assets
```

**Stage 2: Nginx**

```dockerfile
FROM nginx:alpine
# Copy Nginx config
# Copy dist folder from builder
# Create non-root user
# Expose port 80
```

**Why Nginx?**

- Lightweight (~40MB)
- Excellent static file serving
- Built-in compression
- Reverse proxy for API requests
- Production-ready

## Health Checks

All services have health checks configured:

```yaml
healthcheck:
  test: [check command]
  interval: 30s # Check every 30 seconds
  timeout: 10s # Timeout after 10 seconds
  retries: 3 # Mark unhealthy after 3 failures
  start_period: 40s # Grace period before first check
```

### API Health Check

```bash
curl http://localhost:8000/health
```

Requires health endpoint in your API.

### MongoDB Health Check

```bash
mongosh mongodb://mindscribe:password@localhost:27017 --eval "db.runCommand('ping')"
```

### Web Health Check

```bash
wget http://localhost:3000/
```

## Security Features

1. **Non-root Users**
   - API: `nodejs` user (uid: 1001)
   - Web: `nginx-user` user (uid: 1001)
   - Prevents container escape vulnerabilities

2. **Minimal Base Images**
   - node:22-alpine: ~350MB
   - nginx:alpine: ~40MB
   - Reduces attack surface

3. **Read-only Root Filesystem** (Optional addition)

   ```yaml
   security_opt:
     - no-new-privileges:true
   read_only: true
   ```

4. **Resource Limits** (Optional addition)
   ```yaml
   deploy:
     resources:
       limits:
         cpus: "1"
         memory: 512M
       reservations:
         cpus: "0.5"
         memory: 256M
   ```

## Performance Optimization

### API Optimization

- Multi-stage build removes 1GB+ of build artifacts
- Production dependencies only (no devDependencies)
- Alpine Linux: smaller base image
- Non-root user: security best practice

### Web Optimization

- Gzip compression: ~70% size reduction
- Cache busting: HTML never cached
- Long-term caching: JS/CSS/images cached for 1 year
- CDN-ready: Static files with immutable headers

### Build Performance

- .dockerignore files reduce context size
- Caching: Unchanged layers reused
- Parallel builds: With `docker-compose --parallel`

## Common Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs api
docker-compose logs mongo

# Check port availability
netstat -tulpn | grep 8000
netstat -tulpn | grep 27017
```

### Database connection fails

```bash
# Verify MongoDB is healthy
docker-compose exec mongo mongosh -u mindscribe -p mindscribe_password

# Check network connectivity
docker-compose exec api ping mongo
docker-compose exec api curl http://mongo:27017
```

### Build fails

```bash
# Force rebuild without cache
docker-compose build --no-cache

# Check build logs
docker build -f docker/Dockerfile.api . --verbose
```

### Container runs out of memory

```bash
# Increase Docker memory limit
# Mac/Windows: Docker Desktop → Preferences → Resources → Memory

# Or add limits to docker-compose.yml:
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
```

## Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mindscribe
```

### Using Kubernetes

```bash
# Convert compose to Kubernetes manifests
kompose convert

# Deploy
kubectl apply -f .
```

### Using Cloud Platforms

**AWS ECS**

```bash
# Create ECR repositories
aws ecr create-repository --repository-name mindscribe-api
aws ecr create-repository --repository-name mindscribe-web

# Push images
docker tag mindscribe-api:latest <account>.dkr.ecr.<region>.amazonaws.com/mindscribe-api:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/mindscribe-api:latest
```

**Google Cloud Run**

```bash
# Build and push
gcloud builds submit --tag gcr.io/<project>/mindscribe-api

# Deploy
gcloud run deploy mindscribe-api --image gcr.io/<project>/mindscribe-api
```

**Azure Container Instances**

```bash
# Build and push
az acr build --registry <registry> --image mindscribe-api:latest .

# Deploy
az container create --image <registry>.azurecr.io/mindscribe-api:latest
```

## Monitoring

### Container Metrics

```bash
# Real-time stats
docker stats

# Container logs with timestamps
docker-compose logs --timestamps

# Follow specific service
docker-compose logs -f api
```

### Performance Monitoring

```bash
# Check image sizes
docker images | grep mindscribe

# Container inspect
docker inspect mindscribe-api

# Disk usage
docker system df
```

## Cleanup

### Remove all containers

```bash
docker-compose down
```

### Remove all containers and volumes

```bash
docker-compose down -v
```

### Remove unused Docker resources

```bash
docker system prune        # Remove unused items
docker system prune -a     # Remove all unused items including images
docker volume prune        # Remove unused volumes
```

## Next Steps

1. **Configure OAuth credentials** in .env
2. **Set up MongoDB Atlas** for databases (optional)
3. **Deploy to production** using your preferred platform
4. **Setup CI/CD** to automatically build and push images
5. **Monitor logs and metrics** in production
6. **Implement backup strategy** for MongoDB data
