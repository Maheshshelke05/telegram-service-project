# Deploying TeleBotHost to a single AWS EC2 (Free Tier)

This guide shows how to run the full stack (frontend, backend, bot engine, Postgres) on one EC2 instance using Docker Compose. Target OS: Ubuntu 22.04 LTS (t2.micro / t3.micro).

Prereqs:
- An AWS EC2 instance running Ubuntu 22.04 (free-tier-compatible type)
- Security Group: allow TCP 22, 3000 (frontend), 5000 (backend). Do NOT open PostgreSQL (5432) to public unless you need it.
- You must copy the project to the server (git clone, scp, or use a repository).

Steps (summary):

1. SSH into your EC2 instance.
2. Copy the project files to the server (Git, scp, or zip upload).
3. Create a `.env` on the server based on `.env.example` and set `JWT_SECRET`.
4. Run the one-line installer to install Docker and Docker Compose, then start the stack:

```bash
# on the EC2 instance
chmod +x ./deploy/deploy_to_ec2.sh
sudo ./deploy/deploy_to_ec2.sh
# after install completes
cp .env.example .env
# edit .env to set JWT_SECRET and any production DB_URL if using external DB
docker compose up -d --build
```

Notes and important configuration:
- The `docker-compose.yml` mounts the host Docker socket into the `backend` service so the backend can create/manage bot containers.
- Keep the server secure: restrict SSH by IP and rotate `JWT_SECRET` to a strong value.
- The bot-engine image is built locally by Compose; the backend uses Dockerode to launch containers from that image. Ensure the Compose build completes successfully.

Optional: create a systemd unit to ensure `docker compose` starts on reboot (example in script).
