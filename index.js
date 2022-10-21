var express = require("express");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

var mangUsers = ["aaa"];

io.on("connection", function (socket) {
    console.log(socket.id + " đăng nhập");
    socket.on("disconnect", function () {
        console.log(socket.id + " ngắt kết nối");
        mangUsers.splice(mangUsers.indexOf(socket.Username), 1);
        socket.broadcast.emit("Server-send-listOnline", mangUsers);
    })
    socket.on("Client-send-Username", function (data) {
        console.log("Server: Client-send-Username : " + data)
        if (mangUsers.indexOf(data) >= 0) {
            //dang ky that bai - vi co trong mang roi - khong can truyen data
            if (data === "" || data === null) {
                socket.emit("Server-send-loginFail", "để trống");
            } else {
                socket.emit("Server-send-loginFail", "trung ten");
            }
        } else {//thanh cong
            console.log(data);
            socket.Username = data;
            mangUsers.push(data);
            socket.emit("Server-send-loginSucc", data);
            io.sockets.emit("Server-send-listOnline", mangUsers);
        }
    })
    socket.on("logout", function () {
        mangUsers.splice(mangUsers.indexOf(socket.Username), 1);
        socket.broadcast.emit("Server-send-listOnline", mangUsers);
    })
    socket.on("user-send-message", function (data) {
        io.sockets.emit("server-send-message", socket.Username, data);
    })
    socket.on("toi-dang-go-chu", function () {
        var s = socket.Username + " đang gõ";
        socket.broadcast.emit("server-send-go-chu", s);
        //tạo 1 mảng lưu lại, sau đó appent vào => bên client?
    })
    socket.on("toi-thoat-go-chu", function () {
        var s = socket.Username + " ngưng gõ";
        io.sockets.emit("server-send-ko-go", s);
        // delete ra khỏi mảng
    })
})


app.get("/", function (req, res) {
    res.render("mainchat")
})