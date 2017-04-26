using System.Collections.Generic;
using WebSocketSharp.Server;
using System.Web.Script.Serialization;
using WebSocketSharp;
using System.Linq;
using System;

namespace VideoSync
{
    public class Server : WebSocketBehavior
    {
        private static List<Client> clients = new List<Client>();
        private Dictionary<string, bool> clientList;
        private string ownerID;

        private bool paused;
        private double time;
        private string url;

        private void GetCount()
        {
            Console.WriteLine("Connected clients: " + clients.Count());
        }

        protected override void OnOpen()
        {
            var c = new Client();
            IWebSocketSession s;

            if (Sessions.TryGetSession(Sessions.ActiveIDs.Last(), out s))
            {
                c.ID = s.ID;
                clients.Add(c);
                



                Console.WriteLine("Client connected with ID: " + c.ID);
                
                Console.WriteLine("");
                //tell the owner that they are the owner
                if (clients.Count == 1)
                {
                    var cm = new ClientMessage();
                    cm.action = (int)ACTIONS.SETOWNER;
                    cm.data = clients[0].ID;
                    ownerID = (string)cm.data;

                    var json = new JavaScriptSerializer().Serialize(cm);
                    Console.WriteLine(json);
                    Send(json);
                }
                else
                {
                    var cm = new ClientMessage();
                    cm.action = (int)ACTIONS.CONNECTED;
                    cm.data = clients.Last().ID;


                    var json = new JavaScriptSerializer().Serialize(cm);
                    Console.WriteLine(json);
                    Send(json);

                    if(paused)
                    {
                        BroadcastExcept(ACTIONS.BROADCASTPAUSE, null);
                    }
                    else
                    {
                        BroadcastExcept(ACTIONS.BROADCASTPLAY, null);
                    }

                    BroadcastExcept(ACTIONS.BROADCASTURL, url);


                }
            }
        }

        protected override void OnClose(CloseEventArgs e)
        {
            
            
        }

        protected override void OnMessage(MessageEventArgs e)
        {

            Console.WriteLine("Recieved data: " + e.Data);
            var obj = new JavaScriptSerializer().Deserialize(e.Data, typeof(ClientMessage));

            ClientMessage cm = (ClientMessage)obj;

            switch(cm.action)
            {
                //owner requests a time sync
                //the owner's time is sent back to all other clients and set
                //CLIENTSIDE NOTE: clients could use a threshold to determine if it is
                //worth the effort to sync time. ex: if they're within +- 0.02s of owner -- don't sync
                case (int)ACTIONS.SETTIME:
                    BroadcastExcept(ACTIONS.BROADCASTTIME, cm.data);
                    break;

                //owner requests to set a new url
                //the new url is broadcasted back to all clients except owner
                //CLIENTSIDE NOTE: clients should all set currentTime to 0
                case (int)ACTIONS.SETURL:
                    url = (string)cm.data;
                    BroadcastExcept(ACTIONS.BROADCASTURL, cm.data);
                    break;

                //Broadcast owner's pause request to all clients
                case (int)ACTIONS.REQUESTPAUSE:
                    paused = true;
                    BroadcastExcept(ACTIONS.BROADCASTPAUSE, null);
                    break;

                //Broadcast owner's pause request to all clients
                case (int)ACTIONS.REQUESTPLAY:
                    paused = false;
                    BroadcastExcept(ACTIONS.BROADCASTPLAY, null);
                    break;

                //Echo chat back to all
                case (int)ACTIONS.SENDCHAT:
                    var c = new ClientMessage();
                    c.action = (int)ACTIONS.BROADCASTCHAT;
                    c.data = cm.data;
                    var json = new JavaScriptSerializer().Serialize(c);
                    Sessions.Broadcast(json);
                    break;

                case (int)ACTIONS.DISCONNECTED:
                    var prevOwner = clients[0].ID;
                    clientList = Sessions.Broadping();
                    for (int i =0; i<clients.Count; i++)
                    {
                        if(clients[i].ID==(string)cm.data)
                        {
                            Console.WriteLine("Removed client ID: " + clients[i].ID);
                            clients.RemoveAt(i);

                        }
                    }

                    if ((string)cm.data==prevOwner)
                    {
                        Console.WriteLine("Owner disconnected setting new one...");
                        var cc = new ClientMessage();
                        cc.action = (int)ACTIONS.SETOWNER;

                        var newOwner = clientList.Where(pv => pv.Value == true).Select(pv => pv.Key).First();
                        cc.data = newOwner;
                        ownerID = newOwner;

                        var js = new JavaScriptSerializer().Serialize(cc);
                        Console.WriteLine(js);
                        
                        
                        Sessions.SendTo(js, newOwner);
                    }
                    else
                    {
                        Console.WriteLine("Client disconnected.");
                    }
                    
                    

                    GetCount();
                    break;

            }

            
        }

        private void BroadcastExcept(ACTIONS action, object data)
        {
            foreach(Client c in clients)
            {
                if (c.ID != ownerID)
                {
                    //construct our message
                    var msg = new ClientMessage();
                    msg.action = (int)action;
                    msg.data = data;

                    //serialize and send
                    var json = new JavaScriptSerializer().Serialize(msg);
                    Sessions.SendTo(json, c.ID);
                }
            }
            
            
        }

        
    }
}
