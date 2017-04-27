using System;
using System.Configuration;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using WebSocketSharp;
using WebSocketSharp.Net;
using WebSocketSharp.Server;

namespace VideoSync
{
    class Program
    {
        public static void Main(string[] args)
        {


            var httpsv = new HttpServer(80);

            // To resolve to wait for socket in TIME_WAIT state.
            //httpsv.ReuseAddress = true;

            // Set the document root path.
            var reader = new System.Configuration.AppSettingsReader();
            httpsv.RootPath = (string)reader.GetValue("RootPath", typeof(string));

            // Set the HTTP GET request event.
            httpsv.OnGet += (sender, e) => {
                var req = e.Request;
                var res = e.Response;

                var path = req.RawUrl;
                if (path == "/")
                    path += "index.html";

                var content = httpsv.GetFile(path);
                if (content == null)
                {
                    res.StatusCode = (int)HttpStatusCode.NotFound;
                    return;
                }

                if (path.EndsWith(".html"))
                {
                    res.ContentType = "text/html";
                    res.ContentEncoding = Encoding.UTF8;
                }
                else if (path.EndsWith(".js"))
                {
                    res.ContentType = "application/javascript";
                    res.ContentEncoding = Encoding.UTF8;
                }
                else if (path.EndsWith(".css"))
                {
                    res.ContentType = "text/css";
                    res.ContentEncoding = Encoding.UTF8;
                }

                res.WriteContent(content);
            };

            // Add the WebSocket services.
            httpsv.AddWebSocketService<Server>("/ws");

            
            httpsv.Start();
            if (httpsv.IsListening)
            {
                Console.WriteLine("Listening on port {0}, and providing WebSocket services:", httpsv.Port);
                foreach (var path in httpsv.WebSocketServices.Paths)
                    Console.WriteLine("- {0}", path);
            }

            

            Console.WriteLine("\nPress Enter key to stop the server...");
            Console.ReadLine();

            httpsv.Stop();
        }
    }
}
