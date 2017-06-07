mkdir bin\Debug\
copy "lib\websocket-sharp.dll" "bin\Debug\websocket-sharp.dll"
mcs Program.cs Server.cs ClientMessage.cs /out:bin\Debug\VideoSync.exe /reference:lib\websocket-sharp.dll /reference:lib\System.Web.Extensions.dll
pause