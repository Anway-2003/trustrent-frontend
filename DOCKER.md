# TrustRent Docker Setup

This document explains how to run TrustRent using Docker containers.

## Prerequisites

- Docker
- Docker Compose
- Make (optional, for easier commands)

## Quick Start

### Development Environment

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start development databases:**
   ```bash
   make dev
   # or
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Install dependencies and setup database:**
   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Production Environment

1. **Build and start all services:**
   ```bash
   make setup-prod
   # or
   docker build -t trustrent .
   docker-compose up -d
   ```

2. **Access the application:**
   - Main app: http://localhost
   - Direct app access: http://localhost:3000

## Docker Services

### Development (docker-compose.dev.yml)
- **postgres**: PostgreSQL database on port 5432
- **redis**: Redis cache on port 6379

### Production (docker-compose.yml)
- **postgres**: PostgreSQL database
- **redis**: Redis cache
- **app**: TrustRent Next.js application
- **nginx**: Reverse proxy with rate limiting

## Environment Variables

### Development
```bash
DATABASE_URL="postgresql://trustrent_user:trustrent_password@localhost:5432/trustrent_dev?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Production
```bash
DATABASE_URL="postgresql://trustrent_user:trustrent_password@postgres:5432/trustrent?schema=public"
REDIS_URL="redis://redis:6379"
```

## Available Commands

### With Make
```bash
make help          # Show all available commands
make dev           # Start development environment
make dev-down      # Stop development environment
make prod          # Start production environment
make prod-down     # Stop production environment
make build         # Build Docker image
make logs          # Show application logs
make clean         # Clean up Docker resources
make setup-dev     # Complete development setup
make setup-prod    # Complete production setup
```

### With npm/Docker Compose
```bash
npm run docker:dev         # Start development databases
npm run docker:dev:down    # Stop development databases
npm run docker:prod        # Start production environment
npm run docker:prod:down   # Stop production environment
npm run docker:build       # Build Docker image
npm run docker:logs        # Show application logs
```

## Database Management

### Migrations
```bash
# In development (with local Node.js)
npm run db:migrate

# In production (inside container)
docker-compose exec app npx prisma migrate deploy
```

### Seeding
```bash
# In development
npm run db:seed

# In production
docker-compose exec app npx prisma db seed
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U trustrent_user -d trustrent

# Connect to Redis
docker-compose exec redis redis-cli
```

## Monitoring and Logs

### Application Logs
```bash
docker-compose logs -f app
```

### Database Logs
```bash
docker-compose logs -f postgres
```

### All Services
```bash
docker-compose logs -f
```

## Persistent Data

Docker volumes are used to persist data:
- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis persistence files
- `app_uploads`: User uploaded files

## Security Considerations

### Development
- Default passwords are used for easy setup
- Services are exposed on host ports

### Production
- Change all default passwords
- Use strong JWT secrets
- Configure SSL certificates
- Review nginx security headers
- Use environment-specific secrets

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database connectivity:
   ```bash
   docker-compose exec app nc -z postgres 5432
   ```

### Application Won't Start
1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec app env | grep DATABASE
   ```

### Port Conflicts
If ports 3000, 5432, or 6379 are already in use, modify the port mappings in docker-compose files.

## Scaling

### Horizontal Scaling
```bash
docker-compose up -d --scale app=3
```

### Resource Limits
Add resource limits to docker-compose.yml:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

## Backup and Restore

### Database Backup
```bash
docker-compose exec postgres pg_dump -U trustrent_user trustrent > backup.sql
```

### Database Restore
```bash
docker-compose exec -T postgres psql -U trustrent_user trustrent < backup.sql
```

## SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt, commercial CA, etc.)
2. Place certificates in `./ssl/` directory
3. Uncomment HTTPS server block in `nginx.conf`
4. Update environment variables to use HTTPS URLs

## Performance Optimization

### Database
- Monitor slow queries
- Add appropriate indexes
- Configure PostgreSQL settings

### Application
- Enable Redis caching
- Optimize image handling
- Configure CDN for static assets

### Nginx
- Enable gzip compression (already configured)
- Configure proper caching headers
- Implement rate limiting (already configured)
