var express = require("express");
var app = express();
var server = require("http").Server(app);
const hostname = 'localhost';
const port = 3000;
app.set("view engine", "ejs");
app.set("views", "./views");

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

app.get("/", function (req, res) {
    res.render("mainchat")
})