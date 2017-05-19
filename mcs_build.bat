mkdir bin\Debug\
xcopy "lib\websocket-sharp.dll" "bin\Debug\websocket-sharp.dll"
mcs Program.cs Server.cs ClientMessage.cs /out:bin\Debug\VideoSync.exe /reference:lib\websocket-sharp.dll /reference:"C:\Program Files\Mono\lib\mono\4.5\System.Web.Extensions.dll"
pause