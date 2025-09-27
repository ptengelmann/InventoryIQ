#!/usr/bin/env bash
# scripts/container-env-utils.sh
# Utility functions for container engine and volume mapping detection

set -euo pipefail

# Detect container engine: podman or docker
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

# Get correct volume mount option for workspace
# Usage: get_volume_opt <host_path> <container_path>
function get_volume_opt {
  local host_path="$1"
  local container_path="$2"
  local uname_out="$(uname -s)"
  if [[ "$uname_out" == "Linux" ]]; then
    echo "-v ${host_path}:${container_path}:Z"
  elif [[ "$uname_out" == "Darwin" ]]; then
    echo "-v ${host_path}:${container_path}"
  elif [[ "$uname_out" == "MINGW"* || "$uname_out" == "CYGWIN"* || "$uname_out" == "MSYS"* || "$uname_out" == "Windows_NT" ]]; then
    echo "-v ${host_path}:${container_path}"
  else
    echo "-v ${host_path}:${container_path}"
  fi
}
