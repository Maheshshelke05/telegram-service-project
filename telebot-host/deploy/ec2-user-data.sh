#!/bin/bash
# cloud-init / user-data example for Ubuntu
# Replace GIT_REPO and BRANCH with your repository details or copy files via other means.
GIT_REPO="<YOUR_GIT_REPO_URL>"
BRANCH="main"

apt-get update
apt-get install -y git curl
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu || true
mkdir -p /home/ubuntu/telebot-host
cd /home/ubuntu
git clone --branch "$BRANCH" "$GIT_REPO" telebot-host || true
cd telebot-host || exit 1
cp .env.example .env
# Edit .env via cloud-init templating or set values here

docker compose up -d --build
