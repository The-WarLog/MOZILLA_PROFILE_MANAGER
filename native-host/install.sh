#!/usr/bin/env bash
set -euo pipefail

HOST_NAME="firefox_profile_manager"
EXT_ID="profile-manager@example.com"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_TS="$SCRIPT_DIR/host.ts"
BIN_PATH="$SCRIPT_DIR/host-native"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required to build the native host. Install from https://bun.sh" >&2
  exit 1
fi

echo "Building standalone native host binary..."
bun build "$SRC_TS" --compile --outfile "$BIN_PATH"
chmod +x "$BIN_PATH"

# Install host manifest to standard Firefox location
USER_DIR_1="$HOME/.mozilla/native-messaging-hosts"
USER_DIR_2="$HOME/snap/firefox/common/.mozilla/native-messaging-hosts"

for TARGET_DIR in "$USER_DIR_1" "$USER_DIR_2"; do
  mkdir -p "$TARGET_DIR"
  TARGET_FILE="$TARGET_DIR/${HOST_NAME}.json"
  cat > "$TARGET_FILE" <<JSON
{
  "name": "${HOST_NAME}",
  "description": "Native host for Firefox Profile Manager extension",
  "path": "${BIN_PATH}",
  "type": "stdio",
  "allowed_extensions": ["${EXT_ID}"]
}
JSON
  echo "Installed native host manifest to: $TARGET_FILE"
done

echo "Ensure the extension's gecko id matches: ${EXT_ID}"
