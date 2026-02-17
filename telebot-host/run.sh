#!/usr/bin/env bash
set -e

# Convenience wrapper — run the deploy bootstrap script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
chmod +x deploy/bootstrap.sh
exec ./deploy/bootstrap.sh
