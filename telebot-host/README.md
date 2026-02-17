# TeleBotHost

Production-ready SaaS to create, deploy and manage Telegram bots using Docker.

Run locally (one-command bootstrap):

On Linux (supports Ubuntu and Amazon Linux):

```bash
cd telebot-host
chmod +x run.sh
./run.sh
```

On Windows (requires Docker Desktop):

```powershell
cd telebot-host
.\deploy\bootstrap.ps1
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

See `.env.example` for required environment variables.
