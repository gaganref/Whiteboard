const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {

    // use WebSocket first, if available
    transports: ["websocket", "polling"],
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const server_port = process.env.YOUR_PORT || process.env.PORT || 8883;

let latestData;

io.on('connection', (socket)=> {
    console.log('User Online');

    io.to(socket.id).emit('canvas-data', latestData);

    socket.on('canvas-data', (data)=> {
        latestData = data;
        socket.broadcast.emit('canvas-data', data);
    });

    // Clearing canvas on no users // optional
    socket.on("disconnect", (reason) => {
        if(io.engine.clientsCount <= 0){
            latestData = null;
            console.log('No users clearing canvas');
        }
    });
});

http.listen(server_port, () => {
    console.log("Started on : "+ server_port);
});