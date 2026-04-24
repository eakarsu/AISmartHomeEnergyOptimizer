#!/bin/bash

# ============================================
# AI Smart Home Energy Optimizer - Start Script
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════╗"
echo "║   AI Smart Home Energy Optimizer             ║"
echo "║   Starting Application...                    ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Clean up ports ----
echo -e "${YELLOW}[1/6] Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"
lsof -ti:${BACKEND_PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:${FRONTEND_PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
echo -e "${GREEN}  Ports cleaned.${NC}"

# ---- Check PostgreSQL ----
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -q; then
    echo -e "${GREEN}  PostgreSQL is running.${NC}"
  else
    echo -e "${RED}  PostgreSQL is not running. Attempting to start...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if pg_isready -q; then
      echo -e "${GREEN}  PostgreSQL started.${NC}"
    else
      echo -e "${RED}  Could not start PostgreSQL. Please start it manually.${NC}"
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}  pg_isready not found. Assuming PostgreSQL is running.${NC}"
fi

# ---- Create database if not exists ----
echo -e "${YELLOW}[3/6] Setting up database...${NC}"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'smart_home_energy'" 2>/dev/null | grep -q 1 || \
  psql -U postgres -c "CREATE DATABASE smart_home_energy" 2>/dev/null || \
  echo -e "${YELLOW}  Database may already exist or using different credentials.${NC}"
echo -e "${GREEN}  Database ready.${NC}"

# ---- Install dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"
cd "$PROJECT_DIR/backend" && npm install --silent 2>&1 | tail -1
cd "$PROJECT_DIR/frontend" && npm install --silent 2>&1 | tail -1
echo -e "${GREEN}  Dependencies installed.${NC}"

# ---- Seed database ----
echo -e "${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node seed.js 2>&1 || echo -e "${YELLOW}  Seed may have partially failed (data might already exist).${NC}"
echo -e "${GREEN}  Database seeded.${NC}"

# ---- Start services with hot reload ----
echo -e "${YELLOW}[6/6] Starting services with hot reload...${NC}"

# Start backend with nodemon for hot reload
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend with Vite (built-in hot reload)
cd "$PROJECT_DIR/frontend"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗"
echo -e "║   Application Started Successfully!          ║"
echo -e "║                                              ║"
echo -e "║   Frontend: http://localhost:${FRONTEND_PORT}             ║"
echo -e "║   Backend:  http://localhost:${BACKEND_PORT}             ║"
echo -e "║                                              ║"
echo -e "║   Login: admin@smarthome.com / admin123      ║"
echo -e "║                                              ║"
echo -e "║   Press Ctrl+C to stop all services          ║"
echo -e "╚══════════════════════════════════════════════╝${NC}"
echo ""

# ---- Graceful shutdown ----
cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  lsof -ti:${BACKEND_PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:${FRONTEND_PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

wait
