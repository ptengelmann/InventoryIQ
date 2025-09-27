#!/bin/zsh


set -euo pipefail

# Usage/help
function show_help {
  echo "Usage: $0 [-c <container_name>] [-i <image_name>] [-f <dockerfile>] [-p <host_port>] [-d] [-I]"
  echo "       $0 [--container-name <name>] [--image-name <name>] [--dockerfile <file>] [--port <host_port>] [--debug] [--interactive]"
  echo "  -c, --container-name   Name for the container (required)"
  echo "  -i, --image-name       Name for the image (required)"
  echo "  -f, --dockerfile       Dockerfile to use (required)"
  echo "  -d, --debug            Enable debug mode"
  echo "  -I, --interactive      Run container in interactive mode (default is detached for VS Code)"
  echo "  -h, --help             Show this help message"
  echo "\nDetached mode is now the default. Use --interactive/-I for shell access."
  exit 1
}


# Default values
DEBUG=0
INTERACTIVE=0
CONTAINER_NAME=""
IMAGE_NAME=""
DOCKERFILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--container-name)
      CONTAINER_NAME="$2"; shift 2 ;;
    -i|--image-name)
      IMAGE_NAME="$2"; shift 2 ;;
    -f|--dockerfile)
      DOCKERFILE="$2"; shift 2 ;;
    -d|--debug)
      DEBUG=1; shift ;;
    -I|--interactive)
      INTERACTIVE=1; shift ;;
    -h|--help)
      show_help ;;
    *)
      echo "Unknown option: $1"; show_help ;;
  esac
done

if [[ -z "$CONTAINER_NAME" || -z "$IMAGE_NAME" || -z "$DOCKERFILE" ]]; then
  echo "Error: --container-name, --image-name, and --dockerfile are required."
  show_help
fi

if [[ ! -f "$DOCKERFILE" ]]; then
  echo "Error: Dockerfile '$DOCKERFILE' not found."
  exit 2
fi

if [[ $DEBUG -eq 1 ]]; then
  set -x
fi


# Detect container engine function
function detect_engine {
  if command -v podman >/dev/null 2>&1; then
    echo "podman"
  elif command -v docker >/dev/null 2>&1; then
    echo "docker"
  else
    echo "Error: Neither Podman nor Docker is installed. Please install one of them." >&2
    exit 3
  fi
}

ENGINE="$(detect_engine)"

# Build image if not exists
if ! $ENGINE image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
  echo "Building image $IMAGE_NAME from $DOCKERFILE..."
  # Pass host user/group IDs to match permissions
  HOST_UID=$(id -u)
  HOST_GID=$(id -g)
  $ENGINE build --build-arg USER_ID=$HOST_UID --build-arg GROUP_ID=$HOST_GID -t "$IMAGE_NAME" -f "$DOCKERFILE" .
fi


# Detect OS for volume mount
WORKSPACE_PATH="$(pwd)"
if [[ $DEBUG -eq 1 ]]; then
  echo "WORKSPACE_PATH='$WORKSPACE_PATH'"
fi
WORKSPACE_PATH="${WORKSPACE_PATH// /}" # Remove spaces for test
if [[ "$(uname -s)" == "Linux" ]]; then
  VOLUME_OPT="-v \"${WORKSPACE_PATH}:/workspace:Z\""
elif [[ "$(uname -s)" == "Darwin" ]]; then
  VOLUME_OPT="-v \"${WORKSPACE_PATH}:/workspace\""
elif [[ "$(uname -s)" == "MINGW"* || "$(uname -s)" == "CYGWIN"* || "$(uname -s)" == "MSYS"* || "$(uname -s)" == "Windows_NT" ]]; then
  VOLUME_OPT="-v \"${WORKSPACE_PATH}:/workspace\""
  echo "Warning: Podman support on Windows is experimental. Docker Desktop is recommended."
else
  VOLUME_OPT="-v \"${WORKSPACE_PATH}:/workspace\""
fi

# Run container
if [[ $INTERACTIVE -eq 1 ]]; then
  eval $ENGINE run -it --rm --name "$CONTAINER_NAME" $VOLUME_OPT "$IMAGE_NAME"
else
  eval $ENGINE run -d --name "$CONTAINER_NAME" $VOLUME_OPT "$IMAGE_NAME"
fi