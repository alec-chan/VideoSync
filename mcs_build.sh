mkdir -p bin/Debug/
mcs Program.cs Server.cs ClientMessage.cs /out:bin/Debug/VideoSync.exe /reference:lib/websocket-sharp.dll /reference:/usr/lib/mono/4.5/System.Web.Extensions.dll
cp lib/websocket-sharp.dll bin/Debug/
