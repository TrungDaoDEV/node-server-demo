var express = require("express");
var app = express();
var ip = require('ip');
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
var PORT = process.env.PORT || 3000;
app.set('port', PORT);

server.listen(PORT);

io.on("connection", function (socket) {
    console.log(socket.id + " đăng nhập tại địa chỉ: " + ip.address() + ":3000");
    socket.on("disconnect", function () {
        console.log(socket.id + " ngắt kết nối");
    })
    socket.on("Client-send-mau", function (data) {
        console.log("Client-send-mau : " + data + " id " + socket.id);
        io.sockets.emit("Server-send-mau", data);
    })
    socket.on("atime", function (data) {
        console.log("atime : " + data.now + " Máy: " + data.may + " mau: " + data.mau + " chay: " + data.chay);
        io.sockets.emit("Server-send-mau", data.mau);
        io.sockets.emit("Server-send-may", data);
    })
})

app.get("/", function (req, res) {
    res.render("doimaunen")
})
