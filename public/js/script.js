//using socket at client side such that rooms and seamless connection happens
const socket = io();

// making all variable and will use them as our feasibility
var videoChatForm = document.getElementById('video-chat-form');
var videoChatRooms = document.getElementById('video-chat-rooms');
var joinBtn = document.getElementById('join');
var roomName = document.getElementById('roomName');
var userVideo = document.getElementById('user-video');
var peerVideo = document.getElementById('peer-video');

// when join button is clicked using event listner
joinBtn.addEventListener("click",()=>{
    if (roomName.value === ""){
        alert("please enter a room name!");
    }else{

        socket.emit("join",roomName.value);


        // here basically the streaming is created on the user side
        //getting the media of the user when they put the room name
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices; //every browser have different user media
        navigator.getUserMedia(
            {
                // first one is object in getUserMedia Function here the audio and video are defines
                audio:false,
                video:true
            },(stream)=>{
                // 2nd is function here comes the streaming
                userVideo.srcObject = stream; //stream is stored in srcObject fo userVideo
                userVideo.onloadedmetadata = (e) => {
                    userVideo.play();
                }
            },(error)=>{
                //here errors are handle
                alert("you can't access media please give permision")
            }
        );

    }
})