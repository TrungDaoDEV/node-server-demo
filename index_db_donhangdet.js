var express = require('express');
var mysql = require('mysql');
// var bodyParser = require('body-parser');
var ip = require('ip');
var cors = require('cors');
const { normalize } = require('path');

var app = express();
// app.use(bodyParser.json());
app.use(cors());
app.use(express.json());//thay cho bodyparser
var server = require("http").Server(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;
app.set('port', port);

io.on("connection", function (socket) {
    // console.log(socket.id + " đăng nhập tại địa chỉ: " + ip.address() + ":3000");
    socket.on("disconnect", function () {
        console.log(socket.id + " ngắt kết nối");
    })
    socket.on("TTM", function (data) {
        // console.log("May : " + data.may + " SL: " + data.sl + " chay: " + data.chay);
        io.sockets.emit("Server-send-TTM", data);
        var datasql = { May: data.may, ChayVo: data.sl, Trangthai: data.chay };
        // var sql = 'INSERT INTO maydet SET ?';
        var sql = `UPDATE maydet SET ? WHERE May='${data.may}` + "'";
        // console.log('data: '+data);
        db.query(sql, datasql, (err, result) => {
            if (err) throw err;
            // console.log("đã udpate 1 dữ liêu " + datasql);
            // res.send({
            //     status: 'du lieu da goi thanh cong',
            //     May: data.may,
            //     ChayVo: data.sl,
            //     Trangthai: data.chay,
            // })
        })
    })
})

var db = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    // port: 8080,
    database: 'donhangdet',
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
app.get('/datamay', (req, res) => {
    var sql = 'SELECT * FROM `maydet`';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /datamay");
        res.send(result);//goi kq cho react native
    })
})
app.get('/data', (req, res) => {
    var sql = 'SELECT maydet.idMD,maydet.Nguon, maydet.May, maydet.Trangthai,hanghoa.TenHH, '
        + 'chitietdonhang.Mau, donhang.NgayDat, COUNT(chitietdet.NgayDet) as SoNgayDet,'
        + ' chitietdonhang.SL_Dat, '
        + 'SUM(chitietdet.SL_Ngay+chitietdet.SL_TC+chitietdet.SL_Dem) as TongDet, '
        + 'COUNT(maydet.May) AS SoMayChay '
        + 'FROM ((((maydet	INNER JOIN chitietdet ON maydet.ChayVo=chitietdet.idCTDH) '
        + 'INNER JOIN chitietdonhang ON chitietdet.idCTDH=chitietdonhang.idCTDH) '
        + 'INNER JOIN donhang ON donhang.idDH=chitietdonhang.idDH) '
        + 'INNER JOIN khachhang ON khachhang.idKH = donhang.idKH) '
        + 'INNER JOIN hanghoa ON hanghoa.idHH = chitietdonhang.idHH '
        + 'GROUP BY maydet.May, hanghoa.TenHH, chitietdonhang.Mau ';

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get /data");
        res.send(result);//goi kq cho react native
    })
})

//xu ly post (insert)
app.post('/data', (req, res) => {
    console.log(req.body);
    //tham so truyen
    var data = { idMD: null, May: req.body.May, ChayVo: req.body.ChayVo, Trangthai: req.body.TT };
    var sql = 'INSERT INTO maydet SET ?';

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("post /data")
        res.send({
            status: 'du lieu da goi thanh cong',
            idMD: null,
            May: req.body.May,
            ChayVo: req.body.ChayVo,
            Trangthai: req.body.Trangthai,
        })
    })
})
app.post('/delete', (req, res) => {
    console.log(req.body);
    //tham so truyen
    var data = { idMD: req.body.idMD };
    var sql = 'DELETE FROM maydet WHERE ?';
    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("post /delete ")
        res.send({
            status: 'du lieu da xóa thanh cong',
            idMD: req.body.idMD,
        })
    })
})
app.post('/update', (req, res) => {
    console.log(req.body);
    const newCus = req.body;
    //tham so truyen
    var data = { idMD: req.body.idMD, May: req.body.May, ChayVo: req.body.ChayVo, Trangthai: req.body.Trangthai, Nguon: null };
    var sql = `UPDATE maydet SET ? WHERE idMD='${req.body.idMD}` + "'";
    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("post /update")
        res.send({
            status: 'du lieu da UPDATE thanh cong',
            idMD: req.body.idMD,
            May: req.body.May,
            ChayVo: req.body.ChayVo,
            Trangthai: req.body.Trangthai,
            Nguon: null,
        })
    })
})

server.listen(port, () => {
    console.log("Server đang chạy tại PORT 3000")
})
// app.listen(3000, ('192.168.1.39'), () => {
//     console.log("Server đang chạy tại PORT 3000")
// })
