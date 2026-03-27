# TrustRent Docker Management

.PHONY: help dev prod build clean logs

# Default command
help:
	@echo "TrustRent Docker Commands:"
	@echo "  make dev      - Start development environment (PostgreSQL + Redis only)"
	@echo "  make dev-down - Stop development environment"
	@echo "  make prod     - Start full production environment with Docker"
	@echo "  make prod-down- Stop production environment"
	@echo "  make build    - Build Docker image"
	@echo "  make logs     - Show application logs"
	@echo "  make clean    - Clean up Docker resources"
	@echo "  make seed     - Seed the database with sample data"
	@echo "  make migrate  - Run database migrations"

# Development environment (only database and Redis)
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ PostgreSQL and Redis are running!"
	@echo "📝 Don't forget to copy .env.example to .env and update the DATABASE_URL"
	@echo "🔧 Run 'npm run db:migrate' to set up the database schema"

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

# Production environment (full stack)
prod:
	@echo "🚀 Starting production environment..."
	docker-compose up -d
	@echo "✅ TrustRent is running at http://localhost"

prod-down:
	@echo "🛑 Stopping production environment..."
	docker-compose down

# Build Docker image
build:
	@echo "🏗️ Building TrustRent Docker image..."
	docker build -t trustrent .

# Show logs
logs:
	@echo "📋 Showing application logs..."
	docker-compose logs -f app

# Clean up Docker resources
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down --volumes --remove-orphans
	docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
	docker system prune -f

# Database operations
migrate:
	@echo "🔄 Running database migrations..."
	npx prisma migrate dev

seed:
	@echo "🌱 Seeding database..."
	npx prisma db seed

# Complete setup for development
setup-dev:
	@echo "🔧 Setting up development environment..."
	cp .env.example .env
	make dev
	sleep 5
	npm install
	npm run db:migrate
	npm run db:seed
	@echo "✅ Development environment ready!"
	@echo "🚀 Run 'npm run dev' to start the development server"

# Complete setup for production
setup-prod:
	@echo "🔧 Setting up production environment..."
	make build
	make prod
	@echo "✅ Production environment ready!"
	@echo "🌐 TrustRent is available at http://localhost"
