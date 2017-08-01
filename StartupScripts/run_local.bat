
for %%a in (%~dp0) do set "p_dir=%%~dpa"
for %%a in (%p_dir:~0,-1%) do set "p2_dir=%%~dpa"

IF "%1" == "debug" (
    IF EXIST "%p2_dir%bin\Debug\VideoSync.exe" (
        echo "Starting up VideoSync websockets service"
        echo "Make sure the utlity server is running. run start_util.bat to start it."
        cd %p2_dir%bin\Debug\
        mono VideoSync.exe
    ) ELSE (
        echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
        CALL %p2_dir%\BuildTools\setup-build-env.bat
        CALL %p2_dir%\BuildTools\mcs_build_debug.bat
        START %p2_dir%\StartupScripts\run_local.bat debug
        EXIT
    )
) ELSE (
    IF EXIST "%p2_dir%bin\Release\VideoSync.exe" (
        echo "Starting up VideoSync websockets service"
        echo "Make sure the utlity server is running. run start_util.bat to start it."
        cd %p2_dir%bin\Release\
        mono VideoSync.exe
    ) ELSE (
        echo "VideoSync.exe does not yet exist, running mcs_build.sh to build it."
        CALL %p2_dir%\BuildTools\setup-build-env.bat
        CALL %p2_dir%\BuildTools\mcs_build.bat
        START %p2_dir%\StartupScripts\run_local.bat
        EXIT
    )
)

cd %p2_dir%
