@echo off
for %%a in (%~dp0) do set "p_dir=%%~dpa"
for %%a in (%p_dir:~0,-1%) do set "p2_dir=%%~dpa"

mcs %p2_dir%VideoSyncServer\Program.cs %p2_dir%VideoSyncServer\Server.cs %p2_dir%VideoSyncServer\ClientMessage.cs /out:%p2_dir%bin\Release\VideoSync.exe /reference:%p2_dir%lib\websocket-sharp.dll /reference:%p2_dir%lib\System.Web.Extensions.dll /define:RELEASE
