//client.js

var socket = new WebSocket('ws://localhost:80/ws');
var video = videojs('video');

var client_id;
var owner = false;

var ACTIONS = {
    SETURL: 0,
    BROADCASTURL: 1,
    SETTIME: 2,
    BROADCASTTIME: 3,
    SETOWNER: 4,
    REQUESTPAUSE: 5,
    REQUESTPLAY: 6,
    BROADCASTPAUSE: 7,
    BROADCASTPLAY: 8,
    SENDCHAT: 9,
    BROADCASTCHAT: 10,
    DISCONNECTED: 11,
    CONNECTED: 12
}

if (!owner) {
    video.off("pause");
    video.off("play");
    video.off("seeked");
}

video.autoplay(true);

video.on("timeupdate", function(){

});

setInterval(function () {
    if (owner) {
        sendMessage(ACTIONS.SETTIME, video.currentTime());
    }
},0.05);

socket.onmessage = function(event)
{
    console.log("recieved message: " + event.toString());
    var msg = JSON.parse(event.data);
    processEvent(msg);
}

window.onbeforeunload = function()
{
    sendMessage(ACTIONS.DISCONNECTED, client_id);
}



video.on("pause", function () {
    if (owner) {
        sendMessage(ACTIONS.REQUESTPAUSE, null);
    }
});

video.on("play", function () {
    if (owner) {
        sendMessage(ACTIONS.REQUESTPLAY, null);
    }
});

video.on("seeked", function () {
    if(owner)
    {
        sendMessage(ACTIONS.SETTIME, video.currentTime());
    }
});


function sendMessage(_action, _data)
{
    var msg = {
        action: _action,
        data: _data
    };

    socket.send(JSON.stringify(msg));
    console.log("sent message: " + JSON.stringify(msg));
}



function processEvent(event)
{
    
    switch(event.action)
    {
        case ACTIONS.SETOWNER:
            client_id = event.data;
            owner = true;
            console.log("I am the owner");
            console.log("ID: " + client_id);
            break;
        case ACTIONS.BROADCASTURL:
            var hostname = (new URL(event.data)).hostname;
            if (hostname == "www.youtube.com")
                video.src({ type: "video/youtube", src: event.data });
            else
                video.src(event.data);
            video.currentTime(0);
            break;
        case ACTIONS.BROADCASTPAUSE:
            video.pause();
            break;
        case ACTIONS.BROADCASTPLAY:
            video.play();
            break;
        case ACTIONS.BROADCASTTIME:
            if (!owner) {
                if (Math.abs(video.currentTime() - event.data) > 0.1) {
                    video.currentTime(event.data);
                }
            }
            break;
        case ACTIONS.CONNECTED:
            client_id = event.data;
            owner = false;
            console.log("I am a client");
            console.log("ID: " + client_id);

    }
}

function seturl()
{
    var url = document.getElementById("url").value;
    var hostname = (new URL(url)).hostname;
    
    if (owner) {
        sendMessage(ACTIONS.SETURL, url);

        if (hostname == "www.youtube.com")
            video.src({ type: "video/youtube", src: url });
        else
            video.src(url);
    }
}



