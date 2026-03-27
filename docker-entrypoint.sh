#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
until nc -z $DATABASE_HOST 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done
echo "Database is up - executing command"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec npx next start
