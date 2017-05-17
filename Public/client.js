//client.js
var path = window.location.pathname;
var href = window.location.href;
var defColor = document.getElementById("headerid").style.color;
var socket = new WebSocket('ws://' + window.location.hostname+':80'+ path);
var video = videojs('video');

var xhr = new XMLHttpRequest();
var client_id;
var owner = false;


var namelength = 8;
////////////////////////////
//ACTIONS mapping -- very critical, 
//this dict has to match exactly with 
//the enum in the server code
////////////////////////////
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
    CLIENTRESPONDTOCOUNT: 14,
    BROADCASTCOUNT: 15
};

var client = new WebTorrent();



///dont allow clients to seek
if (!owner) {
    video.off("seeked");
}

video.autoplay(true);



///sync interval
setInterval(function () {
    if (owner) {
        sendMessage(ACTIONS.SETTIME, video.currentTime());
    }
},0.05);


///recieve ws events and send for processing
socket.onmessage = function (event) {
    console.log("recieved message: " + event.action +":" + event.data);
    var msg = JSON.parse(event.data);
    processEvent(msg);
};



window.onload = function()
{
    chathide();
    $('#chat_msg_box').emojiPicker({
        height: '300px',
        width:  '450px',
    });


}

enquire.register("(min-width:1035px)", {

    // OPTIONAL
    // If supplied, triggered when a media query matches.
    match : function() {
        $(".main").append("<button id='chatbutton'' onclick='chatshow()'><i class='fa fa-commenting-o fa-4x'></i></button>");
    },

    // OPTIONAL
    // If supplied, triggered when the media query transitions
    // *from a matched state to an unmatched state*.
    unmatch : function() {
        $("chatbox").remove();
    },
    setup : function() {
        $(".main").append("<button id='chatbutton'' onclick='chatshow()'><i class='fa fa-commenting-o fa-4x'></i></button>");
    }

 

});

///tell server we are disconnecting
window.onbeforeunload = function () {
    //if(owner)
    //{
    //    return 'Are you sure you want to leave?';
//}
    sendMessage(ACTIONS.DISCONNECTED, client_id);
};


/////// THEATER MODE

/////// END THEATER MODE

/////// CHAT STUFF
function chatshow(){
    
    $('#chat_box').toggle();
    $('#chatbutton').hide();
}
function chathide(){
    $('#chat_box').toggle();
    $('#chatbutton').show();
}

function chat_add_message(msg, me)
{
    if(msg==""){return;}
    var message = msg;
    var align = me?"text-align: right;":"text-align: left;";
    var color = me?" background-color: #000;":"background-color: #424242;";
    var chat = "<div class='msg_container' style='"+align+"'><div class='message' style='"+color+"'><p>"+message+"</p></div></div>";
    
    $("#chat_area").append(chat);
    $(".message").Emoji();
    
    document.getElementById("chat_area").scrollTop = document.getElementById("chat_area").scrollHeight;
}

var last_message_sent;
var myname=owner?"owner":"client";
$("#chat_msg_box").on('keyup', function (e) {
    if (e.keyCode == 13) {
        if($("#chat_msg_box").val()==""){return;}
        last_message_sent=myname+': '+$("#chat_msg_box").val();
        chat_add_message(last_message_sent, true);
        
        sendMessage(ACTIONS.SENDCHAT, last_message_sent);
        $("#chat_msg_box").val("");
    }
});

$("#name").on('keyup', function (e) {
    if (e.keyCode == 13) {
        myname=$("#name").val().slice(0,9);
        $("#name").attr("readonly",true);
    }
});
///// END CHAT STUFF


////Video control event handlers
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



//send websocket message
function sendMessage(_action, _data)
{
    var msg = {
        action: _action,
        data: _data
    };

    socket.send(JSON.stringify(msg));
}

function insertWelcome()
{
    var poster = document.getElementsByClassName("vjs-poster")[0];
    poster.innerHTML="<h4 id='welcomemsg'>Welcome!</h4><ol id='welcomelist'><li>Load a video by pasting a video url into the Set URL box or drag and drop a .mp4 file from your computer onto the page.</li><li>Share your room code with friends.</li><li>Enjoy watching your video with friends!</li><li>If something goes wrong, just click the sync.theater link at the top to generate a new room.</li></ol>";
    document.getElementById("welcomemsg").style.color="#FFC107";

}

///Process a recieved websocket event
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
            document.getElementById("seturl").addEventListener("click", function(event){seturl();});
            //document.getElementById("setass").addEventListener("click", function(event){setass();});
            insertWelcome();
            DragDrop('body', function (files) {
                if(files.length==1&&files[0].name.endsWith('.mp4')){
                    if(client.torrents.length>0)
                    {
                        client.remove(client.torrents[0]);
                    }
                    client.seed(files, function (torrent) {
                        var torrentID = torrent.magnetURI;
                        console.log('Client is seeding ' + torrent.magnetURI)
                        document.getElementById("url").value = torrentID;
                        
                        addFromTorrent(torrent);
                        seturl(true);
                    })
                }
                else
                {
                    alert("We don't support multi-file upload or files other than .mp4, sorry!");
                }
            });

            break;
        case ACTIONS.BROADCASTURL:
            document.getElementById("url").value=event.data;
            //send the recieved url to our url parser
            parseurl(event.data);
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
        //when connected as a client
        case ACTIONS.CONNECTED:
            client_id = event.data;
            owner = false;
            console.log("I am a client");
            console.log("ID: " + client_id);
            document.getElementById("tool").setAttribute("data-attr", "You are a client - you have no control over the video, just sit back and enjoy!");

            document.getElementById("code").value = href;
            break;
        case ACTIONS.REQUESTCOUNT:
            sendMessage(ACTIONS.CLIENTRESPONDTOCOUNT, client_id);
            break;
        case ACTIONS.BROADCASTCHAT:
            if(event.data!==last_message_sent)
            {
                chat_add_message(event.data, false);
            }
            break;
        case ACTIONS.BROADCASTCOUNT:
            
            break;
    }
}

//adds 
function setass()
{
    var url = document.getElementById("assurl").value;
    video.ass({src: url});
}

//handles the owner setting the url
function seturl(except=false)
{
    var url = document.getElementById("url").value;
    
    
    if (owner) {
        sendMessage(ACTIONS.SETURL, url);


        //send the url to our parser to be dealt with.
        parseurl(url, except);
    }
}




///////////////////////////////////////////
//////////                       //////////
//////////    URL PARSER CODE    //////////
//////////                       //////////
///////////////////////////////////////////
URLTYPES = {
    "bittorrent": ["magnet:", ".torrent"],
    "direct": [".webm", ".mp4", ".gifv", ".ogg", ".ogv", ".mkv", ".avi", ".mp3", ".flac", ".m4a", ".aac", "video/mp4"],
    "youtube": ["youtube", "youtu.be"],
    "livestream": ["crunchyroll.com", "adultswim.com", "dailymotion.com","daisuki.net","funimation.com","drive.google.com","mlg.tv","9anime.to","nbc.com","nbcsports.com","periscope.tv","streamable.com","twitch.tv","ustream.tv","weeb.tv"]
};

function containsAny(file, substrings) {
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (file.name.endsWith(substring)) {
         return file;
       }
    }
    return null; 
}

function addFromTorrent(torrent)
{
     //Torrents can contain many files. Let's use the .mp4 file
    var file = torrent.files.find(function (file) {
        //return containsAny(file, URLTYPES["direct"]);
        return file.name.endsWith('.mp4');
    });

    if(file==null)
    {
        alert("Direct upload and torrents currently only play .mp4 files. Sorry!");
        return;
    }
    console.log(file);

    file.getBlobURL(function (err, url) {
        if (err) return util.error(err)
        video.src({
            src: url,
            type: 'video/mp4'
        });
        
    })
}
function parseurl(url, exceptTorrent)
{
    console.log("parsing url...");
    for(var key in URLTYPES)
    {
        console.log("trying key: "+key);
        for(var i in URLTYPES[key])
        {
            console.log("trying to match extension: "+URLTYPES[key][i]);
            if(url.includes(URLTYPES[key][i]))
            {
                
                console.log("Detected url type: "+key);
                switch(key)
                {
                    case "bittorrent":
                        if(!exceptTorrent){
                            if(client.torrents.length>0)
                            {
                                client.remove(client.torrents[0]);
                            }
                            client.add(url, function (torrent) {
                                addFromTorrent(torrent);
                            });
                        }
                        break;
                        
                    case "youtube":
                        video.src({ type: "video/youtube", src: url });
                        break;

                    case "direct":
                        if(URLTYPES[key][i]=="video/mp4")
                        {
                            video.src({ type: "video/mp4", src: url });
                        }
                        else
                        {
                            //console.log("video/"+URLTYPES[key][i].slice(1));
                            video.src(url);

                            
                        }
                        
                        break;
                    case "livestream":
                        
                        xhr.onreadystatechange = function () {
                            console.log("Got response "+this.readyState+" from URL parser server...");
                            if (this.readyState != 4) return;
                            console.log("Got HTTP status "+this.status+" from URL parser server...");
                            if (this.status == 200) {
                                
                                var data = JSON.parse(this.responseText);

                                video.src({type: "application/x-mpegURL", src: data["unenc-url"]});
                            }

                            // end of state change: it can be after some time (async)
                        };
                        xhr.open("POST", "http://"+window.location.hostname+":8080", true);
                        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                        xhr.send("enc-url="+url);


                }
                return;
            }
        }
        
    }
}






