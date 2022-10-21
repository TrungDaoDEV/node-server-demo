const express = require("express");
const app = express();
var server = require("http").Server(app);
// server.listen(3000);
const { Server } = require("socket.io");
// const io = new Server(server);

const io2 = require("socket.io")(server);

app.get('/', (req, res) => {
    res.send('<h1>Xuất ra ở đây - ko phải cái gì ES6 cũng xài đc</h1>');
});

io2.on('connection', (socket) => {
    console.log('a user connected : ' + socket.id);
    socket.on("client-send-color", function (data) {
        console.log("nhận được : Màu : " + data);
        io2.sockets.emit("server-send-color", data);
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});