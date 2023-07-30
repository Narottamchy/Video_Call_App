//using socket at client side such that rooms and seamless connection happens
const socket = io();

// making all variable and will use them as our feasibility
var videoChatForm = document.getElementById("video-chat-form");
var videoChatRooms = document.getElementById("video-chat-rooms");
var joinBtn = document.getElementById("join");
var roomInput = document.getElementById("roomName");
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");

//created the global variable for the room name so that baar baar roomName.value naa likhe
var roomName = roomInput.value;

// here basically the streaming is created on the user side
//getting the media of the user when they put the room name
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mediaDevices; //every browser have different user media

var creator = false; // this is for the creator of the room

var rtcPeerConnection; // this is for the peer connection

var userStream; // this is for the user stream taaki hum khi bhi access krr paaye baar baar naa likhna pde

var iceServers = {
  iceServers: [
    {urls: "stun:stun.services.mozilla.com"},
    {urls: "stun:stun.l.google.com:19302"},
    {urls: "stun:stun1.l.google.com:19302"},
  ]
}; // this is for the ice servers

// when join button is clicked using event listner
joinBtn.addEventListener("click", () => {
  if (roomInput.value === "") {
    alert("please enter a room name!");
  } else {
    socket.emit("join", roomName);
  }
});

// these events will be emitted from the server side and will be handled here these three are basic on connection start
socket.on("created", () => {
  creator = true;
  navigator.getUserMedia(
    {
      // first one is object in getUserMedia Function here the audio and video are defines
      audio: true,
      video: {width:500,height:720},
    },
    (stream) => {
      // 2nd is function here comes the streaming
      userStream = stream; //store the stream in userStream
      videoChatForm.style = "display:none;";
      userVideo.srcObject = stream; //stream is stored in srcObject fo userVideo
      userVideo.onloadedmetadata = (e) => {
        userVideo.play();
      };
    },
    (error) => {
      //here errors are handle
      alert("you can't access media please give permision");
    }
  );
});

socket.on("joined", () => {
  creator = false;
  navigator.getUserMedia(
    {
      // first one is object in getUserMedia Function here the audio and video are defines
      audio: true,
      video: {width:500,height:720},
    },
    (stream) => {
      // 2nd is function here comes the streaming
      userStream = stream;
      videoChatForm.style = "display:none;";
      userVideo.srcObject = stream; //stream is stored in srcObject fo userVideo
      userVideo.onloadedmetadata = (e) => {
        userVideo.play();
      };
      socket.emit("ready", roomName); // here the ready event is emitted so that creater will be notified
    },
    (error) => {
      //here errors are handle
      alert("you can't access media please give permision");
    }
  );
});

socket.on("full", () => {
  alert("room is full now");
});

socket.on("ready", () => {
  if (creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers); // here the rtcPeerConnection object is created
    rtcPeerConnection.onicecandidate = onIceCandidateFunction; // here the ice candidate function is created
    rtcPeerConnection.ontrack = onTrackFunction; // here the track is added jaise hi candidate milta hai waise hi video bhi toh exchange hogi
    rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream); // idhr se hum peerVideo ko stream denge taaki wo bhi dekh paaye
    rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream); //idhr se video denge upar se audio aur userStream isliye kyuki userStream ka object pass krdiya
    rtcPeerConnection
      .createOffer((offer)=>{
        rtcPeerConnection.setLocalDescription(offer); // here the local description is set on creator side
        socket.emit("offer", offer, roomName); // here the offer is emitted
      },(error)=>{
        console.log(error);
      }
      ); // here the offer is created
      
  }
}); //ye server side se aaega an client ko

socket.on("candidate", (candidate) => {
  var iceCandidate = new RTCIceCandidate(candidate); // here the ice candidate is created
  rtcPeerConnection.addIceCandidate(iceCandidate); // here the ice candidate is added
}); //dono side icecandidate jaane jruri hai

socket.on("offer", (offer) => {
  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers); // here the rtcPeerConnection object is created
    rtcPeerConnection.onicecandidate = onIceCandidateFunction; // here the ice candidate function is created
    rtcPeerConnection.ontrack = onTrackFunction; // here the track is added jaise hi candidate milta hai waise hi video bhi toh exchange hogi
    rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream); // idhr se hum peerVideo ko stream denge taaki wo bhi dekh paaye
    rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream); //idhr se video denge upar se audio aur userStream isliye kyuki userStream ka object pass krdiya
    rtcPeerConnection.setRemoteDescription(offer); // here the remote description is set on joined user side from the creator side
    rtcPeerConnection
      .createAnswer((answer)=>{ // here the answer is created
        rtcPeerConnection.setLocalDescription(answer); // here the local description is set on joined user side
        socket.emit("answer", answer, roomName); // here the offer is emitted
      },(error)=>{
        console.log(error);
      }
      ); // here the offer is created
      
  }
});//offer now signaling server se send krdi hai ab creator ko jo join krega

// now this will run on the creator side for remote description
socket.on("answer", (answer) => {
  rtcPeerConnection.setRemoteDescription(answer); // here the remote description is set on creator side from the joined user side
});

function onIceCandidateFunction(event) {
  if (event.candidate) {
    socket.emit("candidate", event.candidate, roomName);
  }
} //agr event milta hai then candidate emit krdo

function onTrackFunction(event) {
  peerVideo.srcObject = event.streams[0]; //ye event se stream milegi
  peerVideo.onloadedmetadata = (e) => {
    peerVideo.play();
  };
} //agr track milta hai toh peer video mai stream daldo and play krdo on creator side