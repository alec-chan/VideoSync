mkdir -p bin/Release/
mcs VideoSyncServer/Program.cs VideoSyncServer/Server.cs VideoSyncServer/ClientMessage.cs /out:bin/Release/VideoSync.exe /reference:lib/websocket-sharp.dll /reference:lib/System.Web.Extensions.dll /define:RELEASE
cp lib/websocket-sharp.dll bin/Release/
