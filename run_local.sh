if [ -f bin/Debug/VideoSync.exe ]; then
  cd bin/Debug/
  sudo mono VideoSync.exe
else
  echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
  ./mcs_build.sh
  ./run_local.sh
fi
