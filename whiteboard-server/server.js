const express = require('express');
const app =express();
const cors = require("cors");
app.use(cors);
const server = require('http').createServer(app);
const io = require('socket.io')(server, {

    // use WebSocket first, if available
    transports: ["websocket"],
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
const serverName = process.env.NAME || 'Unknown';

server.listen(server_port, () => {
    console.log("Started on : "+ server_port);
    console.log('Hello, I\'m %s, how can I help?', serverName);
});

const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ host: 'redis', port: 6379 });

pubClient.on('connect',() => {
    console.log('connected to redis successfully!');
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter(pubClient, subClient));
})

pubClient.on('error',(error) => {
    console.log('Redis connection error :', error);
})

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

