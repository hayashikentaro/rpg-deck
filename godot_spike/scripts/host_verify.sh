#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GODOT_SPIKE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$GODOT_SPIKE_DIR/.env.local"
MODE="${1:-run}"
LOG_PATH="/tmp/rpg-deck-godot-run.log"
ENV_LOADED="no"
HOST_ARCH="$(uname -m)"
HOST_OS="$(uname -s)"

if [[ -f "$ENV_FILE" ]]; then
  echo "Loading local env file: $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  ENV_LOADED="yes"
fi

resolve_godot_bin() {
  if [[ -n "${GODOT_BIN:-}" ]]; then
    echo "$GODOT_BIN"
    return
  fi

  local candidates=(
    "/Applications/Godot_mono.app/Contents/MacOS/Godot"
    "/Applications/Godot.app/Contents/MacOS/Godot"
  )

  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done

  echo ""
}

resolve_dotnet_root() {
  if [[ -n "${DOTNET_ROOT:-}" ]]; then
    echo "$DOTNET_ROOT"
    return
  fi

  local candidates=(
    "/usr/local/share/dotnet"
    "/opt/homebrew/share/dotnet"
  )

  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -d "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done

  echo ""
}

GODOT_BIN="$(resolve_godot_bin)"
DOTNET_ROOT="$(resolve_dotnet_root)"
EFFECTIVE_GODOT_ARCH="${GODOT_ARCH:-}"
if [[ -z "$EFFECTIVE_GODOT_ARCH" && "$HOST_OS" == "Darwin" && "$HOST_ARCH" == "arm64" ]]; then
  EFFECTIVE_GODOT_ARCH="arm64"
fi
if [[ -z "$EFFECTIVE_GODOT_ARCH" && "$HOST_OS" == "Darwin" ]]; then
  if [[ "$(sysctl -in sysctl.proc_translated 2>/dev/null || true)" == "1" ]]; then
    EFFECTIVE_GODOT_ARCH="arm64"
  fi
fi

FORCE_ARCH="no"
if [[ -n "$EFFECTIVE_GODOT_ARCH" ]]; then
  FORCE_ARCH="yes"
fi

PROJECT_FILE="$GODOT_SPIKE_DIR/project.godot"
PROJECT_JSON="$GODOT_SPIKE_DIR/data/project.json"

if [[ "$MODE" != "run" && "$MODE" != "verbose" && "$MODE" != "build" && "$MODE" != "editor" ]]; then
  echo "Unknown mode: $MODE" >&2
  echo "Usage: $0 [run|verbose|build|editor]" >&2
  exit 2
fi

if [[ -z "$GODOT_BIN" || ! -x "$GODOT_BIN" ]]; then
  cat >&2 <<'EOF'
Godot binary was not found or is not executable.
Set GODOT_BIN directly or create godot_spike/.env.local, for example:
GODOT_BIN=/Applications/Godot_mono.app/Contents/MacOS/Godot
DOTNET_ROOT=/usr/local/share/dotnet
GODOT_ARCH=arm64
EOF
  exit 1
fi

if [[ -z "$DOTNET_ROOT" || ! -d "$DOTNET_ROOT" ]]; then
  cat >&2 <<'EOF'
DOTNET_ROOT was not found.
Set DOTNET_ROOT directly or create godot_spike/.env.local, for example:
GODOT_BIN=/Applications/Godot_mono.app/Contents/MacOS/Godot
DOTNET_ROOT=/usr/local/share/dotnet
GODOT_ARCH=arm64
EOF
  exit 1
fi

if [[ "$FORCE_ARCH" == "yes" && ! -x "$(command -v arch || true)" ]]; then
  echo "Cannot force Godot architecture because the 'arch' command is unavailable." >&2
  exit 1
fi

if [[ ! -f "$PROJECT_FILE" ]]; then
  echo "Missing Godot project file: $PROJECT_FILE" >&2
  exit 1
fi

if [[ ! -f "$PROJECT_JSON" ]]; then
  cat >&2 <<EOF
Missing godot_spike/data/project.json.
Ask Codex/container to prepare it from packages/sample-projects/tiny-rpg/project.json or copy Project JSON from the editor.
EOF
  exit 1
fi

echo "Godot host verification"
echo "  mode: $MODE"
echo "  local env loaded: $ENV_LOADED"
echo "  Godot binary: $GODOT_BIN"
echo "  DOTNET_ROOT: $DOTNET_ROOT"
echo "  host arch: $HOST_ARCH"
echo "  effective Godot arch: ${EFFECTIVE_GODOT_ARCH:-default}"
echo "  force arch: $FORCE_ARCH"
echo "  Godot project path: $GODOT_SPIKE_DIR"
echo "  project JSON: present"
if [[ "$MODE" == "verbose" ]]; then
  echo "  verbose log: $LOG_PATH"
fi

run_godot() {
  if [[ "$FORCE_ARCH" == "yes" ]]; then
    DOTNET_ROOT="$DOTNET_ROOT" PATH="$DOTNET_ROOT:$PATH" arch "-$EFFECTIVE_GODOT_ARCH" "$GODOT_BIN" "$@"
    return
  fi

  DOTNET_ROOT="$DOTNET_ROOT" PATH="$DOTNET_ROOT:$PATH" "$GODOT_BIN" "$@"
}

case "$MODE" in
  run)
    run_godot --path "$GODOT_SPIKE_DIR"
    ;;
  verbose)
    run_godot --verbose --path "$GODOT_SPIKE_DIR" 2>&1 | tee "$LOG_PATH"
    ;;
  build)
    run_godot --headless --path "$GODOT_SPIKE_DIR" --build-solutions --quit
    ;;
  editor)
    run_godot --editor --path "$GODOT_SPIKE_DIR"
    ;;
esac
