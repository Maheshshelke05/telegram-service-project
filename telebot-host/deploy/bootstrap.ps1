<#
PowerShell bootstrap for Windows (requires Docker Desktop installed)
Run as: Open PowerShell as Administrator and run: .\deploy\bootstrap.ps1
#>
param()

Write-Host "==> TeleBotHost Windows bootstrap"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location (Join-Path $root "..")

if (-not (Test-Path .env)) {
  Write-Host "No .env found — copying .env.example to .env"
  Copy-Item .env.example .env -Force
  $secret = [guid]::NewGuid().ToString().Replace('-', '') + [guid]::NewGuid().ToString().Replace('-', '')
  (Get-Content .env) -replace '^JWT_SECRET=.*', "JWT_SECRET=$secret" | Set-Content .env
  if (-not (Select-String -Path .env -Pattern '^JWT_SECRET=' -Quiet)) {
    Add-Content .env "JWT_SECRET=$secret"
  }
  Write-Host "Generated JWT_SECRET and updated .env"
} else {
  Write-Host ".env already exists — skipping creation"
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Docker not found. Please install Docker Desktop for Windows, then re-run this script." -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting services with Docker Compose..."
docker compose up -d --build

Write-Host "The script finished. If services are not up, check Docker Desktop or run 'docker compose ps' and 'docker compose logs backend'."
