# Docker Setup for RenoXpert Client

This project is containerized using Docker and docker-compose for easy development and deployment.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later

## Quick Start

### Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at http://localhost:3000

### Development Mode

For development, you can mount your code and use hot reloading:

```bash
# Create docker-compose.dev.yml (see below)
docker-compose -f docker-compose.dev.yml up
```

## File Structure

- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Production compose configuration
- `.dockerignore` - Files to exclude from Docker context

## Dockerfile Details

The Dockerfile uses a multi-stage build:

1. **Base Stage**: Installs pnpm and dependencies
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Creates the final production image with only necessary files

This approach results in a smaller final image (~300MB vs ~1.5GB).

## Environment Variables

You can customize the deployment by setting environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  # Add your custom environment variables here
```

For sensitive data, consider using Docker secrets or environment files:

```yaml
env_file:
  - .env.production
```

## Adding More Next.js Apps

When you add a second Next.js app to the monorepo:

1. Create a separate Dockerfile for each app (or use build args)
2. Add a new service in `docker-compose.yml`:

```yaml
services:
  client-app:
    # ... existing config
    
  admin-app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - APP_NAME=admin-app
    ports:
      - "3001:3000"
```

Then update the Dockerfile to accept build arguments:

```dockerfile
ARG APP_NAME=client-app
# ... rest of Dockerfile
```

## Production Deployment

For production, consider:

1. **Build optimization**: Enable BuildKit for faster builds
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

2. **Security**: Use non-root user in production
   ```dockerfile
   RUN addgroup --system --gid 1001 nodejs && \
       adduser --system --uid 1001 nextjs
   USER nextjs
   ```

3. **Resource limits**: Add limits in docker-compose.yml
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 1G
   ```

## Troubleshooting

### Build fails with "pnpm install" error
- Ensure `pnpm-lock.yaml` is up to date
- Try: `docker-compose build --no-cache`

### Container exits immediately
- Check logs: `docker-compose logs client-app`
- Verify port 3000 is not in use

### Module not found errors
- Ensure all dependencies are in `package.json`
- Rebuild: `docker-compose down -v && docker-compose up -d --build`

## Useful Commands

```bash
# Rebuild without cache
docker-compose build --no-cache

# View running containers
docker-compose ps

# Execute command in container
docker-compose exec client-app sh

# View container resource usage
docker stats renoxpert-client-app

# Clean up (removes containers, networks, and volumes)
docker-compose down -v
```

## CI/CD Integration

For GitHub Actions or similar:

```yaml
- name: Build and push
  run: |
    docker-compose build
    docker-compose push
```

