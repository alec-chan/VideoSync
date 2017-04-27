using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp.Server;
using WebSocketSharp.Net.WebSockets;
using WebSocketSharp;

namespace VideoSync
{
    class ClientMessage
    {
        public int action;
        public object data;
    }


    public enum ACTIONS
    {
        //url operations
        SETURL,         //owner->server
        BROADCASTURL,   //server->other clients

        //time operations
        SETTIME,        //owner->server
        BROADCASTTIME,  //server->other clients

        //initially set owner
        SETOWNER,       //server->client

        //pause/play operations
        REQUESTPAUSE,   //owner->server
        REQUESTPLAY,    //owner->server
        BROADCASTPAUSE, //server->other clients
        BROADCASTPLAY,  //server->other clients

        //chat functions
        SENDCHAT,       //client->server
        BROADCASTCHAT,  //server->others

        DISCONNECTED,       //client->server
        CONNECTED,          //server->client
        REQUESTCOUNT,       //server->clients
        CLIENTRESPONDTOCOUNT //owner-> server
    }

    public class Client
    {

        public WebSocketContext Context;
        //
        // Summary:
        //     Gets the unique ID of the session.
        public string ID;
        //
        // Summary:
        //     Gets the WebSocket subprotocol used in the session.
        public string Protocol;
        //
        // Summary:
        //     Gets the time that the session has started.
        public DateTime StartTime;
        //
        // Summary:
        //     Gets the state of the WebSocketSharp.WebSocket used in the session.
        public WebSocketState State;
    }
}
