#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> TeleBotHost bootstrap script"

if [ ! -f .env ]; then
  echo "No .env found — copying .env.example to .env"
  cp .env.example .env
  # generate JWT secret
  if command -v openssl >/dev/null 2>&1; then
    SECRET=$(openssl rand -hex 32)
  else
    SECRET=$(date +%s | sha256sum | cut -c1-64)
  fi
  # replace JWT_SECRET line or append
  if grep -q '^JWT_SECRET=' .env; then
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${SECRET}|" .env
  else
    echo "JWT_SECRET=${SECRET}" >> .env
  fi
  echo "Generated JWT_SECRET and updated .env"
else
  echo ".env already exists — skipping creation"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Attempting automatic install on Debian/Ubuntu..."
  if [ -f /etc/debian_version ]; then
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl enable --now docker
    echo "Docker installed"
  else
    echo "Automatic Docker install is not supported on this OS. Please install Docker manually and re-run this script." >&2
    exit 1
  fi
fi

echo "Starting services with Docker Compose..."
docker compose up -d --build

echo "Waiting for backend to become healthy (http://localhost:5000/api/health)"
for i in {1..30}; do
  if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "Backend is up"
    exit 0
  fi
  echo -n "."
  sleep 2
done

echo "Backend did not become ready in time. Showing backend logs (last 200 lines):"
docker compose logs backend --tail 200
exit 1
