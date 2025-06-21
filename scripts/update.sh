#!/bin/bash
set -e

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
sudo rm -rf "$FRONTEND_DIR" "$BACKEND_DIR"

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
sudo mkdir -p "$FRONTEND_DIR"
sudo curl -L "$FRONTEND_URL" -o "$FRONTEND_DIR/frontend.zip"
sudo unzip -o "$FRONTEND_DIR/frontend.zip" -d "$FRONTEND_DIR"
sudo rm "$FRONTEND_DIR/frontend.zip"

echo "[+] Downloading and extracting backend..."
sudo mkdir -p "$BACKEND_DIR"
sudo curl -L "$BACKEND_URL" -o "$BACKEND_DIR/backend.zip"
sudo unzip -o "$BACKEND_DIR/backend.zip" -d "$BACKEND_DIR"
sudo rm "$BACKEND_DIR/backend.zip"

echo "[+] Installing backend dependencies..."
cd "$BACKEND_DIR"
sudo npm install

echo "[+] Restarting X server..."
# Launch X server with your preferred options
# Adjust display :0 if necessary
xinit -- -nocursor > /dev/null 2>&1 &

echo "[+] Update and restart complete."
