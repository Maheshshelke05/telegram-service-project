#!/usr/bin/env bash
set -e

echo "==> Installing Docker and Docker Compose (Ubuntu)"
if [ -x "$(command -v docker)" ]; then
  echo "Docker already installed"
else
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker $USER || true
fi

echo "==> Starting Docker service"
sudo systemctl enable --now docker

echo "==> Installing git (if needed)"
sudo apt-get install -y git

echo "==> Pulling up the TeleBotHost stack via docker compose"
if [ ! -f docker-compose.yml ]; then
  echo "docker-compose.yml not found in current dir. Please run this script from the project root where docker-compose.yml exists." >&2
  exit 1
fi

echo "Make sure you updated .env (copy from .env.example) before proceeding."

echo "Bringing up services (build if needed)"
sudo docker compose up -d --build

echo "==> Done. Check services with: sudo docker ps"

cat <<'SYSTEMD'
Optional: Create a systemd service to ensure the stack starts on boot.
Create /etc/systemd/system/telebothost.service with the following content:

[Unit]
Description=TeleBotHost Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/path/to/telebot-host
ExecStart=/usr/bin/docker compose up -d --build
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target

Then enable: sudo systemctl enable telebothost.service
SYSTEMD

echo "Script finished. If you need to re-login for docker group, logout/login or use sudo for docker commands."
