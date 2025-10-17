#!/bin/bash

# Start only the infrastructure services (database, Redis, etc.) for local development
# This allows you to run the API and web services locally while using containerized infrastructure

set -e

SCRIPT_DIR="$(dirname "$(realpath "$0")")"
cd "$SCRIPT_DIR/../docker"

echo "Starting infrastructure services for local development..."
echo "API will be available at: http://localhost:5001 (run with ./dev/start-api)"
echo "Web will be available at: http://localhost:3000 (run with: cd web && pnpm dev)"
echo "Note: Nginx is excluded for local development - access services directly"

docker compose -f docker-compose.yaml -f docker-compose.dev-override.yml up -d

echo ""
echo "Infrastructure services started!"
echo ""
echo "To start the API service locally:"
echo "  ./dev/start-api"
echo ""
echo "To start the web service locally:"
echo "  cd web && pnpm dev"
echo ""
echo "To stop infrastructure services:"
echo "  docker compose -f docker-compose.yaml -f docker-compose.dev-override.yml down"
