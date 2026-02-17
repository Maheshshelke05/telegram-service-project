#!/usr/bin/env bash
set -e

echo "==> Install Docker on DB server (Ubuntu)"
if [ -x "$(command -v docker)" ]; then
  echo "Docker already installed"
else
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io
fi

sudo systemctl enable --now docker

echo "==> Create persistent volume and run postgres container"
sudo docker volume create pgdata || true
sudo docker run -d \
  --name telebothost-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=telebotdb \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:15

echo "Postgres started. Configure security groups so only the App server can connect to port 5432."
