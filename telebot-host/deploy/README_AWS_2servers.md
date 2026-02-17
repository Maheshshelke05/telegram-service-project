# Deploy TeleBotHost across two AWS EC2 instances (app + DB)

This guide deploys the application on two separate EC2 instances:
- App server: runs `frontend`, `backend`, and `bot-engine` containers (via `docker compose`)
- DB server: runs PostgreSQL as a dedicated container (or managed service)

Benefits: separation of concerns, improved security and scalability.

Overview:
1. Provision two EC2 instances (Ubuntu 22.04 recommended).
   - Instance A (App): t3.micro or t3.small. Open ports: 22, 3000, 5000.
   - Instance B (DB): t3.micro. Open ports: 22 and 5432 only from App server (restrict with Security Group).

2. On DB server (Instance B) run Postgres container:

SSH to DB server and run:

```bash
# pull and run postgres container (secure the password)
docker run -d \
  --name telebothost-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=telebotdb \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:15

docker volume create pgdata
```

Ensure the DB server's security group allows incoming traffic on port `5432` only from the App server's IP or security group.

3. On App server (Instance A):

- Copy the project repository to the app server (`git clone` or `scp`).
- Create `.env` in project root and set `DATABASE_URL` to point to DB server, e.g.:

```
DATABASE_URL=postgres://postgres:postgres@DB_SERVER_PRIVATE_IP:5432/telebotdb
JWT_SECRET=replace-with-strong-secret
PORT=5000
NEXT_PUBLIC_API_URL=http://APP_SERVER_PUBLIC_IP:5000
```

- Use the `docker-compose.app.yml` in the project (it runs frontend, backend, bot-engine but not Postgres).

Start app services:

```bash
docker compose -f docker-compose.app.yml up -d --build
```

4. Notes about `docker socket` access

The backend needs access to Docker to create bot containers. There are two options:

- Mount host Docker socket into backend container (current approach). This requires the backend container to run on the same host as Docker (which will be the App server). This is why backend runs on the App server and not remote.
- Alternative: run a Docker API remote daemon (advanced, not recommended without TLS).

5. Verify

- Frontend: http://APP_SERVER_PUBLIC_IP:3000
- Backend: http://APP_SERVER_PUBLIC_IP:5000
- Use Signup → Add Bot (use a real Telegram token) → then call `POST /api/bots/:id/start` to start a container on the App server.

Security Recommendations
- Restrict DB port (5432) to App server only.
- Use strong `JWT_SECRET` and rotate secrets.
- Consider using AWS RDS instead of a self-hosted Postgres for production.
