#!/bin/bash

set -e

GITHUB_REPO="PastaLaPate/Octowindow"
DEFAULT_PATH="/opt/octowindow"
read -rp "Enter installation path [default: $DEFAULT_PATH]: " INSTALL_PATH
INSTALL_PATH="${INSTALL_PATH:-$DEFAULT_PATH}"

FRONTEND_DIR="$INSTALL_PATH/frontend"
BACKEND_DIR="$INSTALL_PATH/backend"

echo "[+] Installation path set to: $INSTALL_PATH"
echo "[+] Updating repos from apt"
sudo apt-get update -qq
echo "[+] Installing required packages..."
sudo apt-get install -y -qq curl unzip

echo "[1/7] Checking if Node.js and npm are installed..."
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "[!] Node.js or npm not found. Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi

echo "[✓] Node.js: $(node -v), npm: $(npm -v)"

echo "[+] Installing express if not installed..."
npm list -g express || sudo npm install -g express

echo "[2/7] Fetching latest release info from GitHub..."
API_URL="https://api.github.com/repos/$GITHUB_REPO/releases/latest"
ASSET_LIST=$(curl -s $API_URL)

FRONTEND_URL=$(echo "$ASSET_LIST" | grep browser_download_url | grep frontend.zip | cut -d '"' -f 4)
BACKEND_URL=$(echo "$ASSET_LIST" | grep browser_download_url | grep backend.zip | cut -d '"' -f 4)

if [[ -z "$FRONTEND_URL" || -z "$BACKEND_URL" ]]; then
  echo "[x] Missing frontend.zip or backend.zip in the latest release."
  exit 1
fi

echo "[3/7] Downloading and extracting frontend..."
sudo mkdir -p "$FRONTEND_DIR"
sudo curl -L "$FRONTEND_URL" -o "$FRONTEND_DIR/frontend.zip"
sudo unzip -o "$FRONTEND_DIR/frontend.zip" -d "$FRONTEND_DIR"
sudo rm "$FRONTEND_DIR/frontend.zip"

echo "[4/7] Downloading and extracting backend..."
sudo mkdir -p "$BACKEND_DIR"
sudo curl -L "$BACKEND_URL" -o "$BACKEND_DIR/backend.zip"
sudo unzip -o "$BACKEND_DIR/backend.zip" -d "$BACKEND_DIR"
sudo rm "$BACKEND_DIR/backend.zip"

echo "[5/7] Installing backend dependencies..."
cd "$BACKEND_DIR"
sudo npm install

echo "[6/7] Adding update script"
UPDATE_SCRIPT="$INSTALL_PATH/update.sh"
# Dont actually create the script just make it executable without sudo password
touch "$UPDATE_SCRIPT"
sudo chmod +x "$UPDATE_SCRIPT"
sudo bash -c 'cat >> /etc/sudoers.d/update_octowindow' <<EOF
$USER ALL=NOPASSWD: $UPDATE_SCRIPT
EOF

echo "[7/7] ✅ Installed"
echo "- Frontend is in: $FRONTEND_DIR"
echo "- Backend is in: $BACKEND_DIR"
echo "- Server log: $BACKEND_DIR/server.log"
echo "You can now reboot"