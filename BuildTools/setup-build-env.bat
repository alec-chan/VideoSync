@echo off
for %%a in (%~dp0) do set "p_dir=%%~dpa"
for %%a in (%p_dir:~0,-1%) do set "p2_dir=%%~dpa"

mkdir %p2_dir%bin\Release\
copy "%p2_dir%lib\websocket-sharp.dll" "%p2_dir%bin\Release\websocket-sharp.dll"
mkdir %p2_dir%bin\Debug\
copy "%p2_dir%lib\websocket-sharp.dll" "%p2_dir%bin\Debug\websocket-sharp.dll"