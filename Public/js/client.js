//client.js
var path = window.location.pathname;
var href = window.location.href;
var defColor = document.getElementById("headerid").style.color;
var socket = new WebSocket('ws://' + window.location.hostname+':80'+ path);
var video = videojs('video');

var xhr = new XMLHttpRequest();
var client_id;
var owner = false;
var isTheater=false;
var connected_count=0;
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
    BROADCASTCOUNT: 15,
    REQUESTQUEUE: 16,
    CLEARQUEUE: 17,
    SKIPTOINDEX: 18,
    RECIEVEQUEUE: 19
};

//var client = new WebTorrent();
var queue = {
    videoqueue: [],
    queueindex: 0
}


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
    //console.log("recieved message: " + event.action +":" + event.data);
    var msg = JSON.parse(event.data);
    processEvent(msg);
};






///tell server we are disconnecting
window.onbeforeunload = function () {
    //if(owner)
    //{
    //    return 'Are you sure you want to leave?';
//}
    sendMessage(ACTIONS.DISCONNECTED, client_id);
};

/////////////////////////
/////  VIDEO QUEUE
/////////////////////////
function setQueue()
{
    
    for(var i in queue.videoqueue)
    {
        addToQueueHTML(queue.videoqueue[i]);
    }
    jumpToIndex(queue.queueindex);
}
function clearqueue()
{
    queue.queueindex=0;
    queue.videoqueue=[];
    $("#queue").html("");
    console.log("queue cleared");
}

function addToQueue(url)
{

    queue.videoqueue.push(url);
    addToQueueHTML(url);
}

function addToQueueHTML(url)
{
    var queuestr="";
    for(var str in queue.videoqueue)
    {
        queuestr+="<a href='#"+str+"' onclick='requestJumpToIndex("+str+"); return false;'>"+queue.videoqueue[str]+"</a><br/>";
    }
    $("#queue").html(queuestr);
    if(queue.queueindex===0)
    {
        parseurl(queue.videoqueue[0],false);
        requestJumpToIndex(0);
    }
}

function requestJumpToIndex(index)
{
    if(owner)
    {
        sendMessage(ACTIONS.SKIPTOINDEX, index);
    }
}
function jumpToIndex(index)
{
    queue.queueindex=index;
    parseurl(queue.videoqueue[index],false);
}

video.on("ended", function () {

    if(queue.queueindex<queue.videoqueue.length)
    {
        queue.queueindex+=1;
        console.log(queue.queueindex+" queue index");
        console.log("attempting to load "+queue.videoqueue[queue.queueindex]);
        requestJumpToIndex(queue.queueindex);
        parseurl(videoqueue[queue.queueindex], false);
        
    }

});


/////////////////////////

/////// CHAT STUFF
function chat_add_message(msg, me)
{
    if(msg==""){return;}
    var message = msg;
    var align = me?"text-align: right;":"text-align: left;";
    var color = me?" background-color: #000;":"background-color: #424242;";
    var chat = "<div class='msg_container' style='"+align+"'><div class='message' style='"+color+"'><p>"+message+"</p></div></div>";
    
    $("#chat_area").append(chat);
    
    document.getElementById("chat_area").scrollTop = document.getElementById("chat_area").scrollHeight;
    blink_chat();
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
        sendMessage(ACTIONS.SETTIME, video.currentTime());
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

function toggleTheaterMode()
{
    if(!isTheater)
    {
        goTheaterMode();
    }
    else
    {
        exitTheaterMode();
    }
}
function goTheaterMode()
{
    isTheater=true;
    document.getElementById("non-video-content").style="display: none;";
    document.getElementById("main-content").style="max-width: 100%; max-height: calc(100vh); width:100%; height: calc(100vh); position: absolute; left: 0; top: 0;";
    document.getElementsByClassName("container")[0].style="display: none;";
    document.getElementsByClassName("video-js")[0].style="height:  calc(100vh);";
    $('body').toggleClass('dimmed');
    document.getElementById("page-content-wrapper").style="padding: 0px;";
}
function exitTheaterMode()
{
    isTheater=false;
    document.getElementById("non-video-content").style="display: inline;";
    document.getElementById("main-content").style="max-width: 960px;";
    document.getElementsByClassName("container")[0].style="display: inline;";
    document.getElementsByClassName("video-js")[0].style="height:  100%;";
    $('body').toggleClass('dimmed');
    document.getElementById("page-content-wrapper").style="padding: 15px;";
}
///Process a recieved websocket event
function processEvent(event)
{
    
    switch(event.action)
    {
        case ACTIONS.SETOWNER:
            client_id = event.data;
            document.getElementById("headerid").style.color = "#FFC107";

            owner = true;
            console.log("I am the owner");
            console.log("ID: " + client_id);
            document.getElementById("code").value = href;
            document.getElementById("addqueue").addEventListener("click", function(event){sendMessage(ACTIONS.SETURL, document.getElementById("url").value); addToQueue(document.getElementById("url").value); document.getElementById("url").value="";});
            document.getElementById("clearqueue").addEventListener("click", function(event){sendMessage(ACTIONS.CLEARQUEUE, null);});
            //document.getElementById("setass").addEventListener("click", function(event){setass();});
            insertWelcome();
            /*DragDrop('body', function (files) {
                if(files.length===1&&files[0].name.endsWith('.mp4')){
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
            });*/

            break;
        case ACTIONS.BROADCASTURL:
            addToQueue(event.data);
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
            console.log("Got ACTIONS.BROADCASTCOUNT: "+event.data);
            var clients=connected_count=event.data-1;
            console.log("clients="+clients);
            if(clients===0)
            {
                $('#subtitle').html("Share your room code! <input type='text' onclick='this.select();' id='code' style='background: transparent;' readonly />");
            }
            else if(clients===1)
            {
                $('#subtitle').html("Watching with "+clients+" other - Invite more! <input type='text' onclick='this.select();' id='code' style='background: transparent;' readonly />");
            }
            else
            {
                $('#subtitle').html("Watching with "+clients+" others - Invite more! <input type='text' onclick='this.select();' id='code' style='background: transparent;' readonly />");
            }
            document.getElementById("code").value = href;
            break;
        case ACTIONS.REQUESTQUEUE:
            if(owner)
            {
                sendMessage(ACTIONS.RECIEVEQUEUE, queue);
            }
            break;
        case ACTIONS.CLEARQUEUE:
            clearqueue();
            break;
        case ACTIONS.SKIPTOINDEX:
            jumpToIndex(event.data);
            break;
        case ACTIONS.RECIEVEQUEUE:
            console.log("recieved queue from owner");
            if(JSON.stringify(event.data)!==JSON.stringify(queue))
            {
                console.log("queues don't match, setting owners queue");
                queue=event.data;
                setQueue();
            }
            break;
    }
}


///////////////////////////////////////////
//////////                       //////////
//////////    URL PARSER CODE    //////////
//////////                       //////////
///////////////////////////////////////////
var URLTYPES = {
    "bittorrent": ["magnet:", ".torrent"],
    "direct": [".webm", ".mp4", ".gifv", ".ogg", ".ogv", ".mkv", ".avi", ".mp3", ".flac", ".m4a", ".aac", "redirector.googlevideo.com", "googleusercontent", "googlevideo"],
    "youtube": ["youtube", "youtu.be"],
    "livestream": ["crunchyroll.com", "adultswim.com", "dailymotion.com","daisuki.net","funimation.com","https://drive.google.com","mlg.tv","9anime.to","nbc.com","nbcsports.com","periscope.tv","streamable.com","twitch.tv","ustream.tv","weeb.tv"]
};


/*function addFromTorrent(torrent)
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
}*/
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
                        /*if(!exceptTorrent){
                            if(client.torrents.length>0)
                            {
                                client.remove(client.torrents[0]);
                            }
                            client.add(url, function (torrent) {
                                addFromTorrent(torrent);
                            });
                        }*/
                        alert("Sorry, we have temporarily removed support for bittorrent files.");
                        break;
                        
                    case "youtube":
                        video.src({ type: "video/youtube", src: url });
                        break;

                    case "direct":
                        if(URLTYPES[key][i]==="redirector.googlevideo.com")
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
                            if (this.status === 200) {
                                
                                var data = JSON.parse(this.responseText);

                                video.src({type: "application/x-mpegURL", src: data["unenc-url"]});
                            }

                            // end of state change: it can be after some time (async)
                        };
                        xhr.open("POST", "http://"+window.location.hostname+":8080", true);
                        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                        xhr.send("enc-url="+url);
                        break;
                    
                }
                video.play();
                return;
            }
        }
        
        if(key==="livestream")
        {
            video.src(url);
        }
        
    }
}






