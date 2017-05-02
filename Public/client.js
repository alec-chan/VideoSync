//client.js
var path = window.location.pathname;
var href = window.location.href;
var defColor = document.getElementById("headerid").style.color;
var socket = new WebSocket('ws://' + window.location.hostname+':80'+ path);
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
    CONNECTED: 12,
    REQUESTCOUNT: 13,
    CLIENTRESPONDTOCOUNT: 14
};

if (!owner) {

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

socket.onmessage = function (event) {
    console.log("recieved message: " + event.toString());
    var msg = JSON.parse(event.data);
    processEvent(msg);
};

window.onbeforeunload = function () {
    sendMessage(ACTIONS.DISCONNECTED, client_id);
};



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
}

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function processEvent(event)
{
    
    switch(event.action)
    {
        case ACTIONS.SETOWNER:
            client_id = event.data;
            document.getElementById("headerid").style.color = "#FFC107";
            document.getElementById("tool").setAttribute("data-attr", "You are the owner - you have full control over the video playback!");
            owner = true;
            console.log("I am the owner");
            console.log("ID: " + client_id);
            document.getElementById("code").value = href;
            //document.getElementById("myid").innerHTML = "You are the owner";
            break;
        case ACTIONS.BROADCASTURL:
            
            if (event.data.includes("youtube"))
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
                if ((Math.abs(video.currentTime() - event.data) > 0.3) && !video.paused()) {
                    video.currentTime(event.data);
                }
            }
            break;
        case ACTIONS.CONNECTED:
            client_id = event.data;
            owner = false;
            console.log("I am a client");
            console.log("ID: " + client_id);
            document.getElementById("tool").setAttribute("data-attr", "You are a client - you have no control over the video, just sit back and enjoy!");
            //document.getElementById("myid").innerHTML = "You are a client";
            document.getElementById("code").value = href;
            break;
        case ACTIONS.REQUESTCOUNT:
            sendMessage(ACTIONS.CLIENTRESPONDTOCOUNT, client_id);
            break;
    }
}

function seturl()
{
    var url = document.getElementById("url").value;
    
    
    if (owner) {
        sendMessage(ACTIONS.SETURL, url);

        if (url.includes("youtube"))
            video.src({ type: "video/youtube", src: url });
        else
            video.src(url);
    }
}






