#!/bin/sh
set -e

echo "Running database migrations..."
bunx prisma db push --url "$DATABASE_URL" --accept-data-loss

echo "Starting admin server..."
exec bun server.js
