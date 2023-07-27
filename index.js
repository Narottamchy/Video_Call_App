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

    socket.on("ready",(roomName)=>{
        console.log("Ready");
        socket.broadcast.to(roomName).emit("ready");
    })
})