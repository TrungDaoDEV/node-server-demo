// var socket = io("http://localhost:3000");
var socket = io("https://node-js-demo-trung.herokuapp.com/");
socket.on("Server-send-loginFail", function (data) {
    alert("đăng nhập thất bại : " + data);
});
socket.on("Server-send-loginSucc", function (data) {
    $("#currentUser").html(data);
    alert("log thanh cong " + data);
    $("#chatForm").show(1000);
    $("#loginForm").hide(2000);
});
socket.on("Server-send-listOnline", function (data) {
    $("#boxContent").html("");
    data.forEach(i => {
        $("#boxContent").append("<div class='useronline'>" + i + "</div>");
    });
});
socket.on("server-send-message", function (username, data) {
    $("#listMessage").append("<div>" + username + " : " + data + "</div>");
});
socket.on("server-send-go-chu", function (username) {
    $("#thongbao").html("<img width='20px' src='typing.gif' ></img>" + username );
});
socket.on("server-send-ko-go", function (username) {
    $("#thongbao").html(username);
});

$(document).ready(function () {
    $("#chatForm").hide();
    $("#loginForm").show();
    $("#btnRegister").click(function () {
        socket.emit("Client-send-Username", $("#txtUsername").val());
    });
    $("#btnLogout").click(function () {
        $("#chatForm").hide(2000);
        $("#loginForm").show(1000);
        socket.emit("logout");
    });
    $("#btnSendMessage").click(function () {
        socket.emit("user-send-message", $("#txtMessage").val());
    });
    $("#txtMessage").focusin(function () {
        socket.emit("toi-dang-go-chu");
    });
    $("#txtMessage").focusout(function () {
        socket.emit("toi-thoat-go-chu");
    });
});
