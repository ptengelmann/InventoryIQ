#!/usr/bin/env bash
# scripts/container-msg-utils.sh
# Utility functions for colored output in container scripts

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

msg_success() {
  echo -e "${GREEN}$*${NC}"
}
msg_warn() {
  echo -e "${YELLOW}$*${NC}"
}
msg_error() {
  echo -e "${RED}$*${NC}"
}
msg_info() {
  echo -e "${WHITE}$*${NC}"
}
