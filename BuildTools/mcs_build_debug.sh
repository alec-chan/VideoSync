mkdir -p bin/Debug/
mcs VideoSyncServer/Program.cs VideoSyncServer/Server.cs VideoSyncServer/ClientMessage.cs /out:bin/Debug/VideoSync.exe /reference:lib/websocket-sharp.dll /reference:lib/System.Web.Extensions.dll /define:DEBUG
cp lib/websocket-sharp.dll bin/Debug/
