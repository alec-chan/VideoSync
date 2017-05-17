#!/bin/bash
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
GREEN='\033[0;32m'

if [ "$(id -u)" != "0" ]; then
	echo "Sorry, you are not root."
	exit 1
else
  if [ -f bin/Debug/VideoSync.exe ]; then
    echo "${GREEN}Starting up VideoSync websockets service${NC}"
    echo "${YELLOW}Make sure the utlity server is running. ./start_util.sh in a new screen to start it.${NC}"
    cd bin/Debug/ && mono VideoSync.exe
  else
    echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
    ./mcs_build.sh
    ./run_local.sh
  fi
fi
