IF EXIST "bin\Debug\VideoSync.exe" (
    echo "Starting up VideoSync websockets service"
    echo "Make sure the utlity server is running. ./start_util.sh in a new screen to start it."
    cd bin\Debug\
    mono VideoSync.exe
) ELSE (
    echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
    CALL mcs_build.bat
    START run_local.bat
    EXIT
)
