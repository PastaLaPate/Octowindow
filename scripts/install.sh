#!/bin/bash

set -e

GITHUB_REPO="PastaLaPate/Octowindow"
INSTALL_DIR="/opt/octodash-frontend"
SERVER_PORT=80

echo "[+] Checking if Node.js and npm are installed..."
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "[!] Node.js or npm not found. Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "[+] Node.js version: $(node -v)"
echo "[+] npm version: $(npm -v)"

echo "[+] Installing express if not installed..."
npm list -g express || sudo npm install -g express

echo "[+] Fetching latest frontend.zip release..."
ASSET_URL=$(curl -s https://api.github.com/repos/$GITHUB_REPO/releases/latest \
  | grep browser_download_url \
  | grep frontend.zip \
  | cut -d '"' -f 4)

if [ -z "$ASSET_URL" ]; then
  echo "[x] Could not find frontend.zip in latest release."
  exit 1
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "[+] Downloading from $ASSET_URL..."
curl -L "$ASSET_URL" -o frontend.zip

echo "[+] Extracting..."
unzip -o frontend.zip
rm frontend.zip

echo "[+] Creating basic express server in $INSTALL_DIR/server.js..."

cat <<EOF > "$INSTALL_DIR/server.js"
const express = require('express');
const app = express();
const port = $SERVER_PORT;

app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(\`Frontend available at http://localhost:\${port}\`);
});
EOF

echo "[+] Installing express locally just in case..."
npm install express

echo "[✓] Done! You can now run:"
echo "    node $INSTALL_DIR/server.js"
