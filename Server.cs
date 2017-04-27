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
        
        private string ownerID="";
        private int clientCount = 0;
        private bool paused;
        private static string url;

        
        private void GetCount()
        {
            Console.WriteLine("Connected clients: " + Sessions.Count);
        }

        protected override void OnOpen()
        {
            
            IWebSocketSession s;
            
            if (Sessions.TryGetSession(Sessions.ActiveIDs.Last(), out s))
            {




                Console.WriteLine("Client connected with ID: " + s.ID);
                
                Console.WriteLine("");
                //tell the owner that they are the owner
                if (Sessions.Count==1)
                {
                    TryGetNewOwner();
                }
                else
                {
                    
                    Send(ConstructMessage(ACTIONS.CONNECTED, s.ID));

                    if(paused)
                    {
                        BroadcastExcept(ACTIONS.BROADCASTPAUSE, null);
                    }
                    else
                    {
                        BroadcastExcept(ACTIONS.BROADCASTPLAY, null);
                    }

                    
                    Send(ConstructMessage(ACTIONS.BROADCASTURL, url));

                }
            }

            Sessions.Broadcast(ConstructMessage(ACTIONS.REQUESTCOUNT, null));
        }

        protected override void OnClose(CloseEventArgs e)
        {
            
            
        }

        protected override void OnMessage(MessageEventArgs e)
        {

            //Console.WriteLine("Recieved data: " + e.Data);
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
                    Sessions.Broadcast(ConstructMessage(ACTIONS.BROADCASTCHAT, cm.data));
                    break;

                case (int)ACTIONS.DISCONNECTED:
                    clientCount--;
                    var prevOwner = ownerID;
                    Sessions.CloseSession((string)cm.data);
                    
                    
                    

                    if ((string)cm.data==prevOwner)
                    {
                        Console.WriteLine("Owner disconnected setting new one...");
                        

                        if (Sessions.Count!=0)
                        {
                            TryGetNewOwner();
                        }
                        else
                        {
                            ownerID = "";
                        }
                    }
                    else
                    {
                        Console.WriteLine("Client disconnected.");
                    }

                    GetCount();
                    break;


                case (int)ACTIONS.CLIENTRESPONDTOCOUNT:
                    clientCount++;
                    Console.WriteLine(clientCount + " clients have responded...");
                    break;
                

            }

            
        }

       

        private void BroadcastExcept(ACTIONS action, object data)
        {
            
            foreach (var c in Sessions.Sessions)
            {
                if (c.ID != ownerID)
                {
                    
                    Sessions.SendTo(ConstructMessage(action, data), c.ID);
                }
            }
            
            
        }

        private void TryGetNewOwner()
        {
            foreach(var c in Sessions.Sessions)
            {
                IWebSocketSession s;

                if(Sessions.TryGetSession(c.ID, out s))
                {
                    

                    ownerID = s.ID;

                    
                    Sessions.SendTo(ConstructMessage(ACTIONS.SETOWNER, s.ID), s.ID);
                    return;
                }
            }
        }

        private string ConstructMessage(ACTIONS action, object data)
        {
            var cc = new ClientMessage();
            cc.action = (int)action;
            cc.data = data;

            var json = new JavaScriptSerializer().Serialize(cc);
            return json;

        }

        
    }
}
