# this shell script is intended to be run by vs code's task runner to setup the build environment on unix machines
mkdir -p bin/Release/
cp "lib/websocket-sharp.dll" "bin/Release/websocket-sharp.dll"
mkdir -p bin/Debug/
cp "lib/websocket-sharp.dll" "bin/Debug/websocket-sharp.dll"