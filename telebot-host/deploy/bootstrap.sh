#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> TeleBotHost bootstrap script"

# Ensure .env exists and has JWT_SECRET
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

# Detect OS and install Docker
install_docker_debian() {
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io
  # attempt to install compose plugin, else fallback to docker-compose binary
  if ! sudo apt-get install -y docker-compose-plugin 2>/dev/null; then
    echo "docker compose plugin not available via apt, will install docker-compose binary"
  fi
  sudo systemctl enable --now docker
}

install_docker_amazon_linux() {
  sudo yum update -y
  # Amazon Linux Extras may provide docker
  if command -v amazon-linux-extras >/dev/null 2>&1; then
    sudo amazon-linux-extras enable docker
    sudo yum clean metadata
    sudo yum install -y docker
  else
    sudo yum install -y docker
  fi
  sudo systemctl enable --now docker
}

install_docker_compose_binary() {
  if command -v docker-compose >/dev/null 2>&1; then
    return
  fi
  echo "Installing docker-compose binary..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    echo "Docker already installed"
    return
  fi

  echo "Docker not found. Attempting automatic install..."
  if [ -f /etc/debian_version ]; then
    install_docker_debian
  elif grep -qi "amzn" /etc/os-release 2>/dev/null || grep -qi "amazon" /etc/system-release 2>/dev/null; then
    install_docker_amazon_linux
  else
    echo "Automatic Docker install is not supported on this OS. Please install Docker manually and re-run this script." >&2
    exit 1
  fi

  # try to ensure docker compose is available
  if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
      echo "docker compose plugin is available"
    else
      # try to install plugin package; if not, install binary
      if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get install -y docker-compose-plugin || true
      fi
      if ! docker compose version >/dev/null 2>&1; then
        install_docker_compose_binary
      fi
    fi
  fi

  # add current user to docker group
  if [ "${SUDO_USER:-}" != "" ]; then
    sudo usermod -aG docker "${SUDO_USER}" || true
  else
    sudo usermod -aG docker "$USER" || true
  fi
  echo "Docker installed/configured. You may need to logout/login for group changes to take effect."
}

install_docker

# Choose compose command
COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  # try to install docker-compose binary
  install_docker_compose_binary
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
  else
    echo "Could not find or install a Docker Compose client. Please install Docker Compose and re-run." >&2
    exit 1
  fi
fi

echo "Starting services with Docker Compose..."
eval "$COMPOSE_CMD up -d --build"

echo "Waiting for backend to become healthy (http://localhost:5000/api/health)"
for i in {1..60}; do
  if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "Backend is up"
    exit 0
  fi
  echo -n "."
  sleep 2
done

echo "Backend did not become ready in time. Showing backend logs (last 200 lines):"
eval "$COMPOSE_CMD logs backend --tail 200"
exit 1
