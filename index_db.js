var express = require('express');
var mysql = require('mysql');
// var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
// app.use(bodyParser.json());
app.use(cors());
app.use(express.json());//thay cho bodyparser
var server = require("http").Server(app);
var db = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    // port: 8080,
    database: 'qlsanluong',
});
// db.connect();
db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
app.get('/', (req, res) => {
    res.send("say hi");
})
//xu ly get (select)
app.get('/data', (req, res) => {
    var sql = 'SELECT * FROM `donhang`';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log(result);
        res.send(result);//goi kq cho react native
    })
})
//xu ly post (insert)
app.post('/data', (req, res) => {
    console.log(req.body);
    //tham so truyen
    var data = { idDH: req.body.idDH, MaDonHang: req.body.MaDH, TenHang: req.body.TenHang };
    var sql = 'INSERT INTO donhang SET ?';
    // console.log('data: '+data);
    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("đã thêm 1 dữ liêu " + data)
        res.send({
            status: 'du lieu da goi thanh cong',
            idDH: req.body.idDH,
            MaDonHang: req.body.MaDH,
            TenHang: req.body.TenHang,
        })
    })
})
app.post('/delete', (req, res) => {
    console.log(req.body);
    //tham so truyen
    var data = { idDH: req.body.idDH };
    var sql = 'DELETE FROM donhang WHERE ?';
    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("đã XÓA 1 dữ liêu " + data)
        res.send({
            status: 'du lieu da xóa thanh cong',
            idDH: req.body.idDH,
        })
    })
})
app.post('/update', (req, res) => {
    console.log(req.body);
    const newCus = req.body;
    //tham so truyen
    var data = { idDH: req.body.idDH, MaDonHang: req.body.MaDH, TenHang: req.body.TenHang };
    var sql = `UPDATE donhang SET ? WHERE idDH='${req.body.idDH}` + "'";
    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("đã UPDATE 1 dữ liêu " + data)
        res.send({
            status: 'du lieu da UPDATE thanh cong',
            idDH: req.body.idDH,
            MaDonHang: req.body.MaDH,
            TenHang: req.body.TenHang,
        })
    })
})

server.listen(3000, () => {
    console.log("Server đang chạy tại PORT 3000")
})
// app.listen(3000, ('192.168.1.39'), () => {
//     console.log("Server đang chạy tại PORT 3000")
// })
