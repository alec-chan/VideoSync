#!/bin/bash

# get VideoSync root dir
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P )


if [ "$1" == "debug" ]; then
  if [ -f "$parent_path"/../bin/Debug/VideoSync.exe ]; then
      cd "$parent_path"/../bin/Debug/ && mono VideoSync.exe
  else
    echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
    sh "$parent_path"/../BuildTools/setup-build-env.sh
    sh "$parent_path"/../BuildTools/mcs_build_debug.sh
    sh "$parent_path"/../StartupScripts/run_local.sh debug
  fi
elif [ "$(id -u)" != "0" ]; then
	echo "Sorry, you are not root."
	exit 1
else
  if [ -f "$parent_path"/../bin/Release/VideoSync.exe ]; then
        cd "$parent_path"/../bin/Release/ && mono VideoSync.exe
  else
    echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
    sh "$parent_path"/../BuildTools/setup-build-env.sh
    sh "$parent_path"/../BuildTools/mcs_build.sh
    sh "$parent_path"/../StartupScripts/run_local.sh
  fi
fi
