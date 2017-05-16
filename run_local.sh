#!/bin/bash
if [ "$(id -u)" != "0" ]; then
	echo "Sorry, you are not root."
	exit 1
else
  if [ -f bin/Debug/VideoSync.exe ]; then
    cd bin/Debug/ && mono VideoSync.exe
    P1=$!
    tmux new-session -d -s pyserver 'cd VideoSyncUtilityServer/ && python server.py'
    P2=$!
    wait $P1 $P2
  else
    echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
    ./mcs_build.sh
    ./run_local.sh
  fi
fi
