#!/bin/bash
# ============================================================
# Generates a WARP WireGuard config for wireproxy
# Run ONCE locally, then paste the output as WARP_PROFILE in Render
# ============================================================
set -e

echo "=== WARP Config Provisioner ==="
echo ""

# Determine architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  ARCH="amd64" ;;
  aarch64) ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
WGCF_BIN="/tmp/wgcf"
WIREPROXY_BIN="/tmp/wireproxy"

# Download wgcf if not present
if [ ! -f "$WGCF_BIN" ]; then
  echo "[1/5] Downloading wgcf ($OS-$ARCH)..."
  WGCF_TAG=$(curl -fsSL "https://api.github.com/repos/ViRb3/wgcf/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)
  WGCF_URL="https://github.com/ViRb3/wgcf/releases/download/${WGCF_TAG}/wgcf_${WGCF_TAG#v}_${OS}_${ARCH}"
  curl -fsSL "$WGCF_URL" -o "$WGCF_BIN"
  chmod +x "$WGCF_BIN"
fi

# Register with Cloudflare WARP
echo "[2/5] Registering WARP account..."
"$WGCF_BIN" register --accept-tos 2>/dev/null

# Generate WireGuard config
echo "[3/5] Generating config..."
"$WGCF_BIN" generate 2>/dev/null

# Check if wgcf-profile.conf was created
if [ ! -f wgcf-profile.conf ]; then
  echo "ERROR: wgcf-profile.conf not generated"
  exit 1
fi

# Download wireproxy for testing
echo "[4/5] Testing config with wireproxy..."
if [ ! -f "$WIREPROXY_BIN" ]; then
  WIREPROXY_VERSION=$(curl -fsSL "https://api.github.com/repos/pufferffish/wireproxy/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)
  WIREPROXY_URL="https://github.com/pufferffish/wireproxy/releases/download/${WIREPROXY_VERSION}/wireproxy_${OS}_${ARCH}.tar.gz"
  echo "  Downloading $WIREPROXY_URL"
  curl -fsSL "$WIREPROXY_URL" -o /tmp/wireproxy.tar.gz
  tar -xzf /tmp/wireproxy.tar.gz -C /tmp wireproxy
  chmod +x "$WIREPROXY_BIN"
  rm /tmp/wireproxy.tar.gz
fi

# Read the generated config
CONFIG=$(cat wgcf-profile.conf)

# Cleanup generated files
rm -f wgcf-profile.conf wgcf-account.toml

echo "[5/5] Done!"
echo ""
echo "============================================================"
echo "COPY THIS INTO YOUR RENDER ENV VAR 'WARP_PROFILE':"
echo "============================================================"
echo ""
echo "$CONFIG"
echo ""
echo "============================================================"
echo "Then deploy to Render. The server will auto-start wireproxy."
echo "============================================================"
