const express =  require('express');
const app = express();

const socket = require('socket.io');

const server = app.listen(3000,()=>{
    console.log('server is running')
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//setting up view engine here using ejs
app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static('public'));

//routing in files so that code doesn't get longer in this file and using them on endpoints
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);


//socket io working with the signaling server
const io =socket(server);
// connection estalishment
io.on("connection",(socket)=>{
    console.log("user connected: " + socket.id);

    // joining the room name event
    socket.on("join",(roomName)=>{
        // this will create a room which is by name of the user and we want a custom room
        var rooms = io.sockets.adapter.rooms;
        
        var room = rooms.get(roomName);
        console.log(room);

        // here defining the room if it is not create yet in the socket yet or not and defining room sizes
        //also emitting the custom events on all conditions
        if(room == undefined){
            socket.join(roomName);
            socket.emit("created");
            console.log("room created")
        }else if(room.size == 1){
            socket.join(roomName);
            socket.emit("joined");
            console.log("room joined")
        }else{
            socket.emit("full");
            console.log("room is full now")
        }
        console.log(rooms); //this is an array of all rooms
    })

    // this is the event for the message sending to the other user who created the room which will be broadcasted to him as the other user joined the room
    socket.on("ready",(roomName)=>{
        console.log("Ready");
        // basically this is the event which will be broadcasted to the other user who created the room and let them know had anyone joined
        socket.broadcast.to(roomName).emit("ready");
    })

    // here the port number is sended to both user as the candidate and the other user will be able to connect to the other user
    socket.on("candidate",(candidate,roomName)=>{
        console.log("Candidate");
        // idhr ice candidate jo hai server side aur client side dono side hum ice candidate bhejre mtlb server se gya client pe catch then clint bhejega
        socket.broadcast.to(roomName).emit("candidate",candidate);
    })

    // offer bheja gya dono sides se and jaise candidate gya waise hi
    socket.on("offer",(offer,roomName)=>{
        console.log("Offer");
        console.log(offer);
        socket.broadcast.to(roomName).emit("offer",offer);
    })

    // answer bheja gya dono sides se and jaise candidate gya waise hi
    socket.on("answer",(answer,roomName)=>{
        console.log("Ready");
        socket.broadcast.to(roomName).emit("answer",answer);
    })
})