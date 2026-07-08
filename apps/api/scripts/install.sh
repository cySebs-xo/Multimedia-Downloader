#!/bin/bash
# Installs yt-dlp, PO token provider, and optional tools
# NOTE: Each step is independent — failures are warnings, not fatal.

echo "[install] Installing yt-dlp..."

# Method 1: python3 pip
INSTALLED=""
if command -v python3 &>/dev/null; then
  python3 -m pip install yt-dlp 2>/dev/null && INSTALLED=1
fi

# Method 2: pip directly
if [ -z "$INSTALLED" ] && command -v pip &>/dev/null; then
  pip install yt-dlp 2>/dev/null && INSTALLED=1
fi

# Method 3: binary download
if [ -z "$INSTALLED" ]; then
  echo "[install] Downloading yt-dlp binary..."
  mkdir -p bin
  curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o bin/yt-dlp 2>/dev/null
  chmod +x bin/yt-dlp 2>/dev/null
fi

# PO Token provider (optional, helps with YouTube bot detection on some IPs)
echo "[install] Installing bgutil PO Token provider..."
if command -v python3 &>/dev/null; then
  python3 -m pip install bgutil-ytdlp-pot-provider 2>/dev/null || echo "[install] WARNING: bgutil not installed (non-fatal)"
fi

echo "[install] Verifying yt-dlp..."
if command -v yt-dlp &>/dev/null; then
  echo "[install] yt-dlp $(yt-dlp --version) found in PATH"
elif [ -f bin/yt-dlp ]; then
  echo "[install] yt-dlp $(./bin/yt-dlp --version) at ./bin/yt-dlp"
else
  echo "[install] WARNING: yt-dlp not found. Set YTDLP_PATH or run: pip install yt-dlp"
fi
