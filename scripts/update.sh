#!/bin/bash
set -e

# NOTE: Sudo is not necessary because the user should have been chowned the installation directory during installation.

GITHUB_REPO="PastaLaPate/Octowindow"
INSTALL_PATH="${1:-/opt/octowindow}"
FRONTEND_DIR="$INSTALL_PATH/frontend"
BACKEND_DIR="$INSTALL_PATH/backend"

echo "[+] Stopping X server and related processes..."
# kill xinit, chromium, ratpoison gracefully (adjust if needed)
pkill -f xinit || true
pkill -f chromium || true
pkill -f ratpoison || true

sleep 2

echo "[+] Removing previous frontend and backend..."
rm -rf "$FRONTEND_DIR" "$BACKEND_DIR"

echo "[+] Fetching latest release info from GitHub..."
API_URL="https://api.github.com/repos/$GITHUB_REPO/releases/latest"
ASSET_LIST=$(curl -s "$API_URL")

FRONTEND_URL=$(echo "$ASSET_LIST" | grep browser_download_url | grep frontend.zip | cut -d '"' -f 4)
BACKEND_URL=$(echo "$ASSET_LIST" | grep browser_download_url | grep backend.zip | cut -d '"' -f 4)

if [[ -z "$FRONTEND_URL" || -z "$BACKEND_URL" ]]; then
  echo "[x] Missing frontend.zip or backend.zip in the latest release."
  exit 1
fi

echo "[+] Downloading and extracting frontend..."
mkdir -p "$FRONTEND_DIR"
curl -L "$FRONTEND_URL" -o "$FRONTEND_DIR/frontend.zip"
unzip -o "$FRONTEND_DIR/frontend.zip" -d "$FRONTEND_DIR"
rm "$FRONTEND_DIR/frontend.zip"

echo "[+] Downloading and extracting backend..."
mkdir -p "$BACKEND_DIR"
curl -L "$BACKEND_URL" -o "$BACKEND_DIR/backend.zip"
unzip -o "$BACKEND_DIR/backend.zip" -d "$BACKEND_DIR"
rm "$BACKEND_DIR/backend.zip"

echo "[+] Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

echo "[+] Rebooting to restart X server..."
reboot