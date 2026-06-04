#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GODOT_SPIKE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$GODOT_SPIKE_DIR/.env.local"
MODE="${1:-run}"
LOG_PATH="/tmp/rpg-deck-godot-run.log"
ENV_LOADED="no"

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
EOF
  exit 1
fi

if [[ -z "$DOTNET_ROOT" || ! -d "$DOTNET_ROOT" ]]; then
  cat >&2 <<'EOF'
DOTNET_ROOT was not found.
Set DOTNET_ROOT directly or create godot_spike/.env.local, for example:
GODOT_BIN=/Applications/Godot_mono.app/Contents/MacOS/Godot
DOTNET_ROOT=/usr/local/share/dotnet
EOF
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
echo "  Godot project path: $GODOT_SPIKE_DIR"
echo "  project JSON: present"
if [[ "$MODE" == "verbose" ]]; then
  echo "  verbose log: $LOG_PATH"
fi

case "$MODE" in
  run)
    DOTNET_ROOT="$DOTNET_ROOT" PATH="$DOTNET_ROOT:$PATH" "$GODOT_BIN" --path "$GODOT_SPIKE_DIR"
    ;;
  verbose)
    DOTNET_ROOT="$DOTNET_ROOT" PATH="$DOTNET_ROOT:$PATH" "$GODOT_BIN" --verbose --path "$GODOT_SPIKE_DIR" 2>&1 | tee "$LOG_PATH"
    ;;
  build)
    DOTNET_ROOT="$DOTNET_ROOT" PATH="$DOTNET_ROOT:$PATH" "$GODOT_BIN" --headless --path "$GODOT_SPIKE_DIR" --build-solutions --quit
    ;;
  editor)
    DOTNET_ROOT="$DOTNET_ROOT" PATH="$DOTNET_ROOT:$PATH" "$GODOT_BIN" --editor --path "$GODOT_SPIKE_DIR"
    ;;
esac
