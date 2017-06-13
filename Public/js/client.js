//client.js
var path = window.location.pathname;
var href = window.location.href;
var defColor = document.getElementById("headerid").style.color;
var socket = new WebSocket('ws://' + window.location.hostname + ':80' + path);
var video = videojs('video');

var xhr = new XMLHttpRequest();
var client_id;
var owner = false;
var isTheater = false;
var connected_count = 0;
var namelength = 8;
var myname;


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
};

$(document).ready(function() {
  var timer;
  $(document).mousemove(function() {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }

    if (isTheater) $("#buttons").fadeIn();

    timer = setTimeout(function() {
      if (isTheater) $("#buttons").fadeOut();
    }, 3000);
  });
});

///dont allow clients to seek
if (!owner) {
  video.off("seeked");
}

video.autoplay(true);

///sync interval
setInterval(function() {
  if (owner) {
    sendMessage(ACTIONS.SETTIME, video.currentTime());
  }
}, 0.05);

///recieve ws events and send for processing
socket.onmessage = function(event) {
  //console.log("recieved message: " + event.action +":" + event.data);
  var msg = JSON.parse(event.data);
  processEvent(msg);
};

window.onload = function() {
  readAllCookies();
};

function readAllCookies()
{
  var name = readCookie("username");
  if (name) {
    $("#name").attr("readonly", true);
    $("#name").replaceWith(
      "<h5 title='Clear your cookies to change your name!'>Welcome back <font color='#FFC107'>" +
        name +
        "</font>!</h5>"
    );
    myname = name;
  } else {
    myname = owner ? "owner" : "client";
  }
  
}

function loadQueueFromCookie()
{
  if(owner)
  {
    var queuehash = readCookie("queuehash");
    if(queuehash)
    {
      document.getElementById("url").value=queuehash;
      sendMessage(ACTIONS.SETURL, document.getElementById("url").value);
      addToQueue(document.getElementById("url").value);
      document.getElementById("url").value = "";

      
    }
  }
}
///tell server we are disconnecting
window.onbeforeunload = function() {
  //if(owner)
  //{
  //    return 'Are you sure you want to leave?';
  //}
  sendMessage(ACTIONS.DISCONNECTED, client_id);
};

/////////////////////////
/////  VIDEO QUEUE
/////////////////////////
function setQueue() {
  for (var i in queue.videoqueue) {
    addToQueueHTML(queue.videoqueue[i]);
  }
  jumpToIndex(queue.queueindex);
}
function clearqueue() {
  queue.queueindex = 0;
  queue.videoqueue = [];
  $("#queue").html("");
  console.log("queue cleared");
  if (!$("#queue").hasClass("hidden")) {
    $("#queue").toggleClass("hidden");
  }
}

function ValidURL(str) {
  var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

  var pattern = new RegExp(expression);
  if (!pattern.test(str)) {
    //alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}

function addToQueue(url) {
  if (ValidURL(url)) {
    queue.videoqueue.push(url);
    addToQueueHTML(url);
  }
  else
  {
    var qu = hashToQueue(url);
    if(qu.hasOwnProperty("queueindex")&&qu.hasOwnProperty("videoqueue"))
    {
      queue=qu;
      setQueue();
    }
  }
}

function highlightCurrent()
{
  $('#queue ol li').each(function(index){
    if(index===queue.queueindex)
    {
      $(this).find("a").css("color","#FFC107");
    }
    else
    {
      $(this).find("a").css("color","#42A5F5");
    }
  });
}

function addToQueueHTML(url) {
  if ($("#queue").hasClass("hidden")) {
    $("#queue").toggleClass("hidden");
  }
  var queuestr = "<ol>";
  for (var str in queue.videoqueue) {
    queuestr +=
      "<li><a href='#" +
      str +
      "' onclick='requestJumpToIndex(" +
      str +
      "); return false;'>" +
      queue.videoqueue[str] +
      "</a></li>";
  }
  queuestr += "</ol>";
  $("#queue").html(queuestr);
  if (queue.queueindex === 0 && video.currentSrc() != queue.videoqueue[0]) {
    parseurl(queue.videoqueue[0], false);
    requestJumpToIndex(0);
  }
  highlightCurrent();
}

function requestJumpToIndex(index) {
  if (owner) {
    sendMessage(ACTIONS.SKIPTOINDEX, index);
  }
}
function jumpToIndex(index) {
  queue.queueindex = index;
  parseurl(queue.videoqueue[index], false);
  highlightCurrent();
}

video.on("ended", function() {
  if (queue.queueindex < queue.videoqueue.length) {
    queue.queueindex += 1;
    console.log(queue.queueindex + " queue index");
    console.log("attempting to load " + queue.videoqueue[queue.queueindex]);
    requestJumpToIndex(queue.queueindex);
    parseurl(videoqueue[queue.queueindex], false);
  }
});
/////////////////////////
//// END OF QUEUE STUFF
/////////////////////////

/////////////////////////
/////// CHAT STUFF
/////////////////////////
function chat_add_message(msg, me) {
  if (msg == "") {
    return;
  }
  var message = msg;
  var align = me ? "text-align: right;" : "text-align: left;";
  var color = me ? " background-color: #212121;" : "background-color: #424242;";
  var chat =
    "<div class='msg_container' style='" +
    align +
    "'><div class='message' style='" +
    color +
    "'><p>" +
    message +
    "</p></div></div>";

  $("#chat_area").append(chat);


  document.getElementById("chat_area").scrollTop = document.getElementById(
    "chat_area"
  ).scrollHeight;
}

var last_message_sent;

$("#chat_msg_box").on("keyup", function(e) {
  if (e.keyCode == 13) {
    if ($("#chat_msg_box").val() == "") {
      return;
    }
    last_message_sent = myname + ": " + $("#chat_msg_box").val();
    chat_add_message(last_message_sent, true);

    sendMessage(ACTIONS.SENDCHAT, last_message_sent);
    $("#chat_msg_box").val("");
  }
});

$("#name").on("keyup", function(e) {
  if (e.keyCode == 13) {
    if ($("#name").val() != "") {
      myname = $("#name").val().slice(0, 13);

      $("#name").attr("readonly", true);
      createCookie("username", myname, 365);
    } else {
      alert("Enter a valid name!");
    }
  }
});
function playSound(filename){   
  document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="assets/sounds/' + filename + '.mp3" type="audio/mpeg" /><source src="assets/sounds/' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="assets/sounds/' + filename +'.mp3" /></audio>';
}
$("#url").on("keyup", function(e) {
  if (e.keyCode == 13) {
    sendMessage(ACTIONS.SETURL, document.getElementById("url").value);
    addToQueue(document.getElementById("url").value);
    document.getElementById("url").value = "";
  }
});

function createCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name, "", -1);
}
/////////////////////
///// END CHAT STUFF
/////////////////////


////Video control event handlers
video.on("pause", function() {
  if (owner) {
    sendMessage(ACTIONS.REQUESTPAUSE, null);
  }
});

video.on("play", function() {
  if (owner) {
    sendMessage(ACTIONS.SETTIME, video.currentTime());
    sendMessage(ACTIONS.REQUESTPLAY, null);
  }
});

video.on("seeked", function() {
  if (owner) {
    sendMessage(ACTIONS.SETTIME, video.currentTime());
  }
});

//send websocket message
function sendMessage(_action, _data) {
  var msg = {
    action: _action,
    data: _data
  };

  socket.send(JSON.stringify(msg));
}

function insertWelcome() {
  var poster = document.getElementsByClassName("vjs-poster")[0];
  poster.innerHTML =
    "<h4 id='welcomemsg'>Welcome!</h4><ol id='welcomelist'><li>Queue a video by pasting a video url into the URL box.</li><li>Share your room code.</li><li>Enjoy watching your videos with friends!</li><li>If something goes wrong, just click the sync.theater link at the top to generate a new room.</li></ol>";
  document.getElementById("welcomemsg").style.color = "#FFC107";
}

function toggleTheaterMode() {
  if (!isTheater) {
    goTheaterMode();
  } else {
    exitTheaterMode();
  }
}

// Function from David Walsh: http://davidwalsh.name/css-animation-callback
function whichTransitionEvent(){
  var t,
      el = document.createElement("fakeelement");

  var transitions = {
    "transition"      : "transitionend",
    "OTransition"     : "oTransitionEnd",
    "MozTransition"   : "transitionend",
    "WebkitTransition": "webkitTransitionEnd"
  }

  for (t in transitions){
    if (el.style[t] !== undefined){
      return transitions[t];
    }
  }
}
var transitionEvent = whichTransitionEvent();

function toggleQueue()
{
  
  $('#video').toggleClass('toggled');
  $('#side-by-side-queue').toggleClass('toggled');

  
}


function goTheaterMode() {
  isTheater = true;
  document.getElementById("non-video-content").style = "display: none;";
  document.getElementById("main-content").style =
    "max-width: 100%; max-height: calc(100vh); width:100%; height: calc(100vh); position: absolute; left: 0; top: 0;";
  document.getElementsByClassName("container")[0].style = "display: none;";
  document.getElementsByClassName("video-js")[0].style =
    "height:  calc(100vh);";
  $("body").toggleClass("dimmed");
  document.getElementById("page-content-wrapper").style = "padding: 0px;";
}


function exitTheaterMode() {
  isTheater = false;
  document.getElementById("non-video-content").style = "display: inline;";
  document.getElementById("main-content").style = "max-width: 1150px;";
  document.getElementsByClassName("container")[0].style = "display: inline;";
  document.getElementsByClassName("video-js")[0].style = "height:  100%;";
  $("body").toggleClass("dimmed");
  document.getElementById("page-content-wrapper").style = "padding: 15px;";
}

///Process a recieved websocket event
function processEvent(event) {
  switch (event.action) {

    case ACTIONS.SETOWNER:
      client_id = event.data;
      document.getElementById("headerid").style.color = "#FFC107";

      owner = true;
      console.log("I am the owner");
      console.log("ID: " + client_id);
      document.getElementById("code").value = href;
      document
        .getElementById("addqueue")
        .addEventListener("click", function(event) {
          sendMessage(ACTIONS.SETURL, document.getElementById("url").value);
          addToQueue(document.getElementById("url").value);
          document.getElementById("url").value = "";
        });
      document
        .getElementById("clearqueue")
        .addEventListener("click", function(event) {
          eraseCookie("queuehash");
          sendMessage(ACTIONS.CLEARQUEUE, null);
        });

      document
        .getElementById("gethash")
        .addEventListener("click", function(event) {
          var hash=convertQueueToHash();
          createCookie("queuehash", hash, 365);
          
          
          
        });

        $("#url").toggleClass("hidden");
        $("#addqueue").toggleClass("hidden");
        $("#clearqueue").toggleClass("hidden");
        loadQueueFromCookie();
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
        if (
          Math.abs(video.currentTime() - event.data) > 0.3 &&
          !video.paused()
        ) {
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
      if (event.data !== last_message_sent) {
        chat_add_message(event.data, false);
      }
      break;
    case ACTIONS.BROADCASTCOUNT:
      console.log("Got ACTIONS.BROADCASTCOUNT: " + event.data);
      var clients = (connected_count = event.data - 1);
      console.log("clients=" + clients);
      if (clients === 0) {
        $("#subtitle").html(
          "Share your room code! <input type='text' onclick='this.select();' id='code' style='background: transparent;' readonly />"
        );
      } else if (clients === 1) {
        $("#subtitle").html(
          "Watching with " +
            clients +
            " other - Invite more! <input type='text' onclick='this.select();' id='code' style='background: transparent;' readonly />"
        );
      } else {
        $("#subtitle").html(
          "Watching with " +
            clients +
            " others - Invite more! <input type='text' onclick='this.select();' id='code' style='background: transparent;' readonly />"
        );
      }
      document.getElementById("code").value = href;
      break;
    case ACTIONS.REQUESTQUEUE:
      if (owner) {
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
      if (JSON.stringify(event.data) !== JSON.stringify(queue)) {
        console.log("queues don't match, setting owners queue");
        queue = event.data;
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
  bittorrent: ["magnet:", ".torrent"],
  direct: [
    ".webm",
    ".mp4",
    ".gifv",
    ".ogg",
    ".ogv",
    ".mkv",
    ".avi",
    ".mp3",
    ".flac",
    ".m4a",
    ".aac",
    "redirector.googlevideo.com",
    "googleusercontent",
    "googlevideo"
  ],
  youtube: ["youtube", "youtu.be"],
  livestream: [
    "crunchyroll.com",
    "adultswim.com",
    "dailymotion.com",
    "daisuki.net",
    "funimation.com",
    "https://drive.google.com",
    "mlg.tv",
    "9anime.to",
    "nbc.com",
    "nbcsports.com",
    "periscope.tv",
    "streamable.com",
    "twitch.tv",
    "ustream.tv",
    "weeb.tv"
  ]
};

// Create Base64 Object
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}


function convertQueueToHash() {
  return Base64.encode(JSON.stringify(queue));
}

function hashToQueue(string) {
  return JSON.parse(Base64.decode(string));
}

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
function parseurl(url, exceptTorrent) {
  console.log("parsing url...");
  for (var key in URLTYPES) {
    console.log("trying key: " + key);
    for (var i in URLTYPES[key]) {
      console.log("trying to match extension: " + URLTYPES[key][i]);
      if (url.includes(URLTYPES[key][i])) {
        console.log("Detected url type: " + key);
        switch (key) {
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
            alert(
              "Sorry, we have temporarily removed support for bittorrent files."
            );
            break;

          case "youtube":
            video.src({ type: "video/youtube", src: url });
            break;

          case "direct":
            if (URLTYPES[key][i] === "redirector.googlevideo.com") {
              video.src({ type: "video/mp4", src: url });
            } else {
              //console.log("video/"+URLTYPES[key][i].slice(1));
              video.src(url);
            }

            break;
          case "livestream":
            xhr.onreadystatechange = function() {
              console.log(
                "Got response " + this.readyState + " from URL parser server..."
              );
              if (this.readyState != 4) return;
              console.log(
                "Got HTTP status " + this.status + " from URL parser server..."
              );
              if (this.status === 200) {
                var data = JSON.parse(this.responseText);

                video.src({
                  type: "application/x-mpegURL",
                  src: data["unenc-url"]
                });
              }

              // end of state change: it can be after some time (async)
            };
            xhr.open(
              "POST",
              "http://" + window.location.hostname + ":8080",
              true
            );
            xhr.setRequestHeader(
              "Content-Type",
              "application/x-www-form-urlencoded; charset=UTF-8"
            );
            xhr.send("enc-url=" + url);
            break;
        }
        video.play();
        return;
      }
    }

    if (key === "livestream") {
      video.src(url);
    }
  }
}
