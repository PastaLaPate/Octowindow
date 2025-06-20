#!/bin/bash

set -e

# Ask for installation path
DEFAULT_PATH="/opt/octowindow"
read -rp "Enter installation path to remove [default: $DEFAULT_PATH]: " INSTALL_PATH
INSTALL_PATH="${INSTALL_PATH:-$DEFAULT_PATH}"

FRONTEND_DIR="$INSTALL_PATH/frontend"
BACKEND_DIR="$INSTALL_PATH/backend"

echo "⚠️  This will remove:"
echo " - $FRONTEND_DIR"
echo " - $BACKEND_DIR"
read -rp "Proceed? [y/N]: " confirm
confirm="${confirm,,}"  # to lowercase
if [[ "$confirm" != "y" && "$confirm" != "yes" ]]; then
  echo "❌ Aborted."
  exit 1
fi

echo "[+] Removing frontend and backend directories..."
sudo rm -rf "$FRONTEND_DIR" "$BACKEND_DIR"

# Check for optional systemd service
SERVICE_FILE="/etc/systemd/system/octowindow.service"
if [[ -f "$SERVICE_FILE" ]]; then
  echo "[+] Found systemd service: octowindow.service"
  read -rp "Do you want to stop and remove this systemd service? [y/N]: " rm_service
  rm_service="${rm_service,,}"
  if [[ "$rm_service" == "y" || "$rm_service" == "yes" ]]; then
    sudo systemctl stop octowindow.service
    sudo systemctl disable octowindow.service
    sudo rm -f "$SERVICE_FILE"
    sudo systemctl daemon-reload
    echo "[✓] Service removed."
  fi
fi

# Prompt to uninstall Node.js + npm
read -rp "Do you want to uninstall Node.js and npm? [y/N]: " rm_node
rm_node="${rm_node,,}"
if [[ "$rm_node" == "y" || "$rm_node" == "yes" ]]; then
  echo "[+] Removing Node.js and npm..."
  sudo apt-get remove -y -qq nodejs npm
  sudo apt-get autoremove -y -qq
  echo "[✓] Node.js and npm removed."
fi

echo "✅ Uninstallation complete."
