
#!/bin/zsh

# Source shared container environment utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-${(%):-%N}}")" && pwd)"
source "$SCRIPT_DIR/container-env-utils.sh"


set -euo pipefail

# Usage/help
function show_help {
  echo "Usage: $0 [-c <container_name>] [-i <image_name>] [-f <dockerfile>] [-p <host_port>] [-d] [-I] [-r]"
  echo "       $0 [--container-name <name>] [--image-name <name>] [--dockerfile <file>] [--port <host_port>] [--debug] [--interactive] [--refresh]"
  echo "  -c, --container-name   Name for the container (required)"
  echo "  -i, --image-name       Name for the image (required)"
  echo "  -f, --dockerfile       Dockerfile to use (required)"
  echo "  -d, --debug            Enable debug mode"
  echo "  -r, --refresh          Remove existing image and rebuild unconditionally before running"
  echo "  -I, --interactive      Run container in interactive mode (default is detached for VS Code)"
  echo "  -h, --help             Show this help message"
  echo "\nDetached mode is now the default. Use --interactive/-I for shell access. Use -r/--refresh to force rebuild."
  exit 1
}


# Default values
DEBUG=0
INTERACTIVE=0
CONTAINER_NAME=""
IMAGE_NAME=""
DOCKERFILE=""
REFRESH=0

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
    -r|--refresh)
      REFRESH=1; shift ;;
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



ENGINE="$(detect_engine)"

# Build image if not exists
if [[ $REFRESH -eq 1 ]]; then
  echo "Refresh requested: removing existing image (if any) and rebuilding $IMAGE_NAME from $DOCKERFILE..."
  if $ENGINE image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
    $ENGINE image rm -f "$IMAGE_NAME" || true
  fi
  # Pass host user/group IDs to match permissions
  HOST_UID=$(id -u)
  HOST_GID=$(id -g)
  $ENGINE build --no-cache --build-arg USER_ID=$HOST_UID --build-arg GROUP_ID=$HOST_GID -t "$IMAGE_NAME" -f "$DOCKERFILE" .
else
  if ! $ENGINE image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
    echo "Building image $IMAGE_NAME from $DOCKERFILE..."
    # Pass host user/group IDs to match permissions
    HOST_UID=$(id -u)
    HOST_GID=$(id -g)
    $ENGINE build --build-arg USER_ID=$HOST_UID --build-arg GROUP_ID=$HOST_GID -t "$IMAGE_NAME" -f "$DOCKERFILE" .
  fi
fi



# Use shared get_volume_opt for correct mapping
WORKSPACE_PATH="$(pwd)"
if [[ $DEBUG -eq 1 ]]; then
  echo "WORKSPACE_PATH='$WORKSPACE_PATH'"
fi
VOLUME_OPT="$(get_volume_opt "$WORKSPACE_PATH" "/workspace")"

# Run container
if [[ $INTERACTIVE -eq 1 ]]; then
  eval $ENGINE run -it --rm --name "$CONTAINER_NAME" $VOLUME_OPT "$IMAGE_NAME"
else
  eval $ENGINE run -d --name "$CONTAINER_NAME" $VOLUME_OPT "$IMAGE_NAME"
fi