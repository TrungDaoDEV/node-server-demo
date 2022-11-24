var express = require('express');
var mysql = require('mysql');
// var bodyParser = require('body-parser');
var ip = require('ip');
var cors = require('cors');

var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");
// app.use(bodyParser.json());
app.use(cors());
app.use(express.json());//thay cho bodyparser
var server = require("http").Server(app);
var io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["socketIO", "polling"],
        credentials: true,
    },
    allowEIO3: true,
});
var PORT = process.env.PORT || 3000;
const datenow = new Date();
app.set('port', PORT);

server.listen(PORT, () => {
    console.log("Server đang chạy tại PORT 3000")
})

io.on("connection", function (socket) {
    var today = new Date();
    time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    console.log(socket.id + " đăng nhập tại địa chỉ: " + ip.address() + ":3000");
    socket.on("disconnect", function () {
        socket.leave(socket.id);
        console.log(socket.id + " ngắt kết nối");
    })

    socket.on("on-time", function (data) {
        console.log(socket.id + " on-time:" + data.a + " " + data.b + " " + data.c);
        io.sockets.emit("on-time", data);
    })
    socket.on("TTMD", function (data) {
        const date = new Date;
        console.log("May : " + data.M + " SL: " + data.SL + " chay: " + data.TT + " date: " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " TIME: " + data.SOF);
        socket.broadcast.emit("Server-send-TTM", data);
        if (data.SOF) {
            var datasql = { May: data.M, Trangthai: data.TT, TG_OFF: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() };
        } else {
            var datasql = { May: data.M, Trangthai: data.TT };
        }
        var sql = `UPDATE maydet SET ? WHERE May='${data.M}` + "'";
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
        var sql2 = 'INSERT INTO ttmjson SET ?';
        var datasql2 = { idRJ: null, May: data.M, Ngay: date, SL: data.SL, Trangthai: data.TT, Nguon: data.P, idMD: 2, TG_OFF: data.TOF, TG_ON: data.TON };
        db.query(sql2, datasql2, (err, result) => {
            if (err) throw err;
        })
    })
    socket.on("TTM", function (data) {
        const date = new Date;
        var timeInMss = date.getTime();
        console.log("May : " + data.may + " SL: " + data.sl + " chay: " + data.chay + " date: " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " TM" + timeInMss + " TIME: " + data.may_dung);
        socket.broadcast.emit("Server-send-TTM", data);
        if (data.may_dung) {
            var datasql = { May: data.may, ChayVo: data.sl, Trangthai: data.chay, TG_OFF: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() };
        } else {
            var datasql = { May: data.may, ChayVo: data.sl, Trangthai: data.chay };
        }
        var sql = `UPDATE maydet SET ? WHERE May='${data.may}` + "'";
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
        var sql2 = 'INSERT INTO ttmjson SET ?';
        var datasql2 = { idRJ: null, May: data.may, Ngay: date, SL: data.sl, Trangthai: data.chay, idMD: 4, TG_OFF: data.tg_dung, TG_ON: data.tg_chay };
        db.query(sql2, datasql2, (err, result) => {
            if (err) throw err;
        })
    })
    // socket.on("TTM", function (data) {
    //     const date = new Date;
    //     console.log("May : " + data.may + " SL: " + data.sl + " chay: " + data.chay + " date: " + date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+" - "+date.getHours()+":"+ date.getMinutes()+":"+date.getSeconds());
    //     io.sockets.emit("Server-send-TTM", data);
    //     var datasql = { May: data.may, ChayVo: data.sl, Trangthai: data.chay };
    //     // var sql = 'INSERT INTO maydet SET ?';
    //     var sql = `UPDATE maydet SET ? WHERE May='${data.may}` + "'";
    //     // console.log('data: '+data);
    //     db.query(sql, datasql, (err, result) => {
    //         if (err) throw err;
    //         // console.log("đã udpate 1 dữ liêu " + datasql);
    //         // res.send({
    //         //     status: 'du lieu da goi thanh cong',
    //         //     May: data.may,
    //         //     ChayVo: data.sl,
    //         //     Trangthai: data.chay,
    //         // })
    //     })
    // })
})

// var db = mysql.createConnection({
//     host: 'us-cdbr-east-06.cleardb.net',
//     user: 'b1a67cdd6b2463',
//     password: '2ff783a8',
//     // port: 8080,
//     database: 'heroku_567fe36f1fa15f6',
// });
var db;
function handleDisconnect() {
    db = mysql.createConnection({
        host: 'us-cdbr-east-06.cleardb.net',
        user: 'b1a67cdd6b2463',
        password: '2ff783a8',
        // port: 8080,
        database: 'heroku_567fe36f1fa15f6',
    }); // Recreate the connection, since
    // the old one cannot be reused.

    db.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
        console.log("********************** data my SQL Connected! *****************");
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    db.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();
// db.connect();
// db.connect(function (err) {
//     if (err) throw err;
//     console.log("********************** data my SQL Connected! *****************");
// });
app.get("/", function (req, res) {
    res.render("doimaunen")
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
        // console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.get('/datamaydung', (req, res) => {
    var sql = 'SELECT * FROM `maydet` WHERE Trangthai LIKE 0';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /datamaydung");
        res.send(result);//goi kq cho react native
    })
})
app.get('/loadsanluong', (req, res) => {
    // var data = {NgayDet: req.headers.ngay};
    var sql = 'SELECT maydet.idMD, maydet.May, maydet.ChayVo, hanghoa.TenHH,chitietdonhang.idCTDH, '
        + ' chitietdonhang.Mau, donhang.NgayDat, chitietdonhang.SL_Dat,'
        + ' SUM(chitietdet.SL_Ngay+chitietdet.SL_TC+chitietdet.SL_Dem) as TongDet'
        // + ' chitietdet.SL_Ngay,chitietdet.SL_TC,chitietdet.SL_Dem,'
        // + ' COUNT(maydet.May) AS SoMayChay'
        + ' FROM ((((maydet LEFT JOIN chitietdet ON maydet.ChayVo=chitietdet.idCTDH)'
        + ' LEFT JOIN chitietdonhang ON chitietdet.idCTDH=chitietdonhang.idCTDH)'
        + ' LEFT JOIN donhang ON donhang.idDH=chitietdonhang.idDH)'
        + ' LEFT JOIN khachhang ON khachhang.idKH = donhang.idKH) '
        + ' LEFT JOIN hanghoa ON hanghoa.idHH = chitietdonhang.idHH'
        + ' GROUP BY maydet.May, hanghoa.TenHH, chitietdonhang.Mau ';

    // db.query(sql, data, (err, result) => {
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get /loadsanluong");
        res.send(result);//goi kq cho react native
    })
})
app.post('/updatemaydet', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { ChayVo: req.body.ChayVo };
    var sql = `UPDATE maydet SET ? WHERE idMD=${req.body.idMD}`

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("update may det ")
        res.send({
            status: 'du lieu da sua thanh cong',
            SL_Dat: req.body.SL_Dat
        })
    })
})
app.get('/loadchitietdet', (req, res) => {
    var sql = 'SELECT SL_Ngay,SL_TC,SL_Dem '
        + ' FROM chitietdet'
        + ` WHERE idCTDH=${req.headers.idctdh}`
        + ` AND idMD=${req.headers.idmd}`
        + ` AND NgayDet='${req.headers.ngaydet}`
        + "' ";

    // db.query(sql, data, (err, result) => {
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get /loadchitietdet " + sql);
        console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.post('/deletectd', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var sql = `DELETE FROM chitietdet WHERE idCTDH=${req.body.idCTDH}`
        + ` AND idMD=${req.body.idMD}`
        + ` AND NgayDet='${req.body.NgayDet}`
        + "' "
        + ` AND SL_Ngay=${req.body.SL_Ngay}`
        + ` AND SL_TC=${req.body.SL_TC}`
        + ` AND SL_Dem=${req.body.SL_Dem}`

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("delete ctd ");
        console.log(sql);
        res.send({
            status: 'du lieu da xóa thanh cong',
            idMD: req.body.idMD,
            idCTDH: req.body.idCTDH,
            Ngay: req.body.Ngay,
            SL_Ngay: req.body.SL_Ngay,
            SL_TC: req.body.SL_TC,
            SL_Dem: req.body.SL_Dem
        })
    })
})
app.get('/data', (req, res) => {
    console.log(req.headers.ngay);
    // var data = {NgayDet: req.headers.ngay};
    var sql = 'SELECT maydet.idMD,maydet.Nguon, maydet.May, maydet.Trangthai,maydet.TG_OFF,hanghoa.TenHH,chitietdonhang.idCTDH, '
        + 'chitietdonhang.Mau, donhang.NgayDat, COUNT(chitietdet.NgayDet) as SoNgayDet,'
        + ' chitietdonhang.SL_Dat, chitietdet.SL_Ngay,chitietdet.SL_TC,chitietdet.SL_Dem,'
        + 'SUM(chitietdet.SL_Ngay+chitietdet.SL_TC+chitietdet.SL_Dem) as TongDet, '
        + 'COUNT(maydet.May) AS SoMayChay '
        + 'FROM ((((maydet LEFT JOIN chitietdet ON maydet.ChayVo=chitietdet.idCTDH) '
        // + 'INNER JOIN chitietdonhang ON (chitietdet.idCTDH=chitietdonhang.idCTDH and ?)) '
        + 'LEFT JOIN chitietdonhang ON chitietdet.idCTDH=chitietdonhang.idCTDH) '
        + 'LEFT JOIN donhang ON donhang.idDH=chitietdonhang.idDH) '
        + 'LEFT JOIN khachhang ON khachhang.idKH = donhang.idKH) '
        + 'LEFT JOIN hanghoa ON hanghoa.idHH = chitietdonhang.idHH '
        + 'GROUP BY maydet.May, hanghoa.TenHH, chitietdonhang.Mau ';

    // db.query(sql, data, (err, result) => {
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get /data");
        res.send(result);//goi kq cho react native
    })
})
app.get('/loadmaychay', (req, res) => {
    // var data = {NgayDet: req.headers.ngay};

    var sql = 'SELECT *,maydet.Trangthai,maydet.May as May,maydet.TG_OFF as time_off, round(sum(ttmjson.TG_OFF/60),2) as stop, round(sum(ttmjson.TG_ON/60),2) as run '
        + ' FROM maydet LEFT JOIN ttmjson ON maydet.May=ttmjson.May and (ttmjson.Ngay BETWEEN ("2022-11-14 9:00:00") AND (NOW())) '
        + ' GROUP BY maydet.May';

    // db.query(sql, data, (err, result) => {
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get /datamaychay");
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
app.get('/ctdh', (req, res) => {
    var data = { idDH: req.headers.iddh };
    var sql = 'SELECT chitietdonhang.idCTDH,chitietdonhang.idDH,chitietdonhang.idHH,chitietdonhang.Mau,'
        + ' hanghoa.TenHH,chitietdonhang.SL_Dat, sum(SL_Ngay+SL_Dem+SL_TC) as SL_Det'
        + ' FROM (`chitietdonhang` inner join `hanghoa` on (chitietdonhang.idHH=hanghoa.idHH and ?)'
        + ' LEFT JOIN chitietdet on chitietdonhang.idCTDH=chitietdet.idCTDH)'
        + ' GROUP BY chitietdonhang.Mau, hanghoa.TenHH';
    db.query(sql, data, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /chitietdonhang");
        // console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.post('/insertctdh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idCTDH: req.body.idCTDH, idDH: req.body.idDH, idHH: req.body.idHH, Mau: req.body.Mau, SL_Dat: req.body.SL_Dat };
    var sql = 'INSERT INTO chitietdonhang SET ?';

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("insert chi tiet đơn hàng table")
        res.send({
            status: 'du lieu da goi thanh cong',
            idCTDH: null,
            idDH: req.body.idDH,
            idHH: req.body.idHH,
            Mau: req.body.Mau,
            SL_Dat: req.body.SL_Dat
        })
    })
})
app.post('/updatectdh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { SL_Dat: req.body.SL_Dat };
    var sql = `UPDATE chitietdonhang SET ? WHERE idCTDH=${req.body.idCTDH}`
        + ` AND idDH=${req.body.idDH}`
        + ` AND idHH=${req.body.idHH}`
        + ` AND Mau='${req.body.Mau}`
        + "' ";

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("update chi tiêt don hàng ")
        res.send({
            status: 'du lieu da sua thanh cong',
            SL_Dat: req.body.SL_Dat
        })
    })
})
app.post('/deletectdh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var sql = `DELETE FROM chitietdonhang WHERE idCTDH=${req.body.idCTDH}`
        + ` AND idDH=${req.body.idDH}`
        + ` AND idHH=${req.body.idHH}`
        + ` AND Mau='${req.body.Mau}`
        + "' ";

    db.query(sql, (err, result) => {
        if (err) throw e1rr;
        console.log("delete hàng hóa")
        res.send({
            status: 'du lieu da xóa thanh cong',
            idCTDH: req.body.idCTDH,
            idDH: req.body.idDH,
            idHH: req.body.idHH,
            Mau: req.body.Mau
        })
    })
})
app.get('/hanghoa', (req, res) => {
    var data = { idKH: req.headers.idkh };
    var sql = 'SELECT * FROM `hanghoa` WHERE ?';
    db.query(sql, data, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /hanghoa");
        // console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.post('/inserthh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idHH: null, TenHH: req.body.TenHH, idKH: req.body.idKH };
    var sql = 'INSERT INTO hanghoa SET ?';

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("insert đơn hàng table")
        res.send({
            status: 'du lieu da goi thanh cong',
            idHH: null,
            TenHH: req.body.TenHH,
            idKH: req.body.idKH
        })
    })
})
app.post('/updatehh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { TenHH: req.body.TenHH, idKH: req.body.idKH };
    var sql = `UPDATE hanghoa SET ? WHERE idHH=${req.body.idHH}`;

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("update hàng hóa")
        res.send({
            status: 'du lieu da sua thanh cong',
            idHH: req.body.idHH,
            TenHH: req.body.TenHH,
            idKH: req.body.idKH
        })
    })
})
app.post('/deletehh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idHH: req.body.idHH };
    var sql = `DELETE FROM hanghoa WHERE ?`;

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("delete hàng hóa")
        res.send({
            status: 'du lieu da xóa thanh cong',
            idHH: req.body.idHH,
        })
    })
})
app.get('/loaddonhang', (req, res) => {
    var data = { idKH: req.headers.idkh };
    var sql = 'SELECT chitietdonhang.idCTDH,khachhang.idKH,khachhang.TenKH,donhang.NgayDat,hanghoa.TenHH,'
        + ' chitietdonhang.Mau, SUM(chitietdet.SL_Ngay+chitietdet.SL_TC+chitietdet.SL_Dem) as SL_Det,'
        + ' chitietdonhang.SL_Dat,donhang.idDH,hanghoa.idHH,hanghoa.TenHH'
        + ' FROM ((((khachhang INNER JOIN donhang ON (khachhang.idKH=donhang.idKH AND donhang.TinhTrang=0))'
        + ' INNER JOIN hanghoa ON hanghoa.idKH=khachhang.idKH)'
        + ' INNER JOIN chitietdonhang ON (chitietdonhang.idDH=donhang.idDH AND hanghoa.idHH=chitietdonhang.idHH))'
        + ' LEFT JOIN chitietdet ON chitietdet.idCTDH=chitietdonhang.idCTDH)'
        + ' GROUP BY chitietdonhang.idCTDH'
        + ' ORDER BY donhang.NgayDat, khachhang.TenKH DESC;';
    db.query(sql, data, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /loaddonhang");
        // console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.get('/donhang', (req, res) => {
    var data = { idKH: req.headers.idkh };
    var sql = 'SELECT * FROM `donhang` WHERE ? ORDER BY NgayDat DESC';
    db.query(sql, data, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /donhang");
        // console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.post('/insertdh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idDH: null, NgayDat: req.body.NgayDat, TinhTrang: req.body.TinhTrang, idKH: req.body.idKH };
    var sql = 'INSERT INTO donhang SET ?';

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("insert đơn hàng table")
        res.send({
            status: 'du lieu da goi thanh cong',
            idDH: null,
            NgayDat: req.body.NgayDat,
            TinhTrang: req.body.TinhTrang,
            idKH: req.body.idKH
        })
    })
})
app.post('/updatedh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { NgayDat: req.body.NgayDat, TinhTrang: req.body.TinhTrang, idKH: req.body.idKH };
    var sql = `UPDATE donhang SET ? WHERE idDH=${req.body.idDH}`;

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("update đơn hàng")
        res.send({
            status: 'du lieu da sua thanh cong',
            idDH: req.body.idDH,
            NgayDat: req.body.NgayDat,
            TinhTrang: req.body.TinhTrang,
            idKH: req.body.idKH
        })
    })
})
app.post('/deletedh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idDH: req.body.idDH };
    var sql = `DELETE FROM donhang WHERE ?`;

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("delete đơn hàng")
        res.send({
            status: 'du lieu da xóa thanh cong',
            idDH: req.body.idDH,
        })
    })
})
app.get('/load_md', (req, res) => {
    var sql = 'SELECT * FROM `maydet`';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /maydet");
        // console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.post('/insert_md', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idMD: null, May: req.body.May, ChayVo: req.body.ChayVo, TrangThai: req.body.TrangThai, Nguon: req.body.Nguon, TG_OFF: req.body.TG_OFF };
    var sql = 'INSERT INTO maydet SET ?';

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("insert máy dệt table")
        res.send({
            status: 'du lieu da goi thanh cong',
            idMD: null,
            May: req.body.May,
            ChayVo: req.body.ChayVo,
            TrangThai: req.body.TrangThai,
            Nguon: req.body.Nguon,
            TG_OFF: req.body.TG_OFF
        })
    })
})
app.get('/khachhang', (req, res) => {
    var sql = 'SELECT * FROM `khachhang`';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("get    /khachhang");
        // console.log(result);
        res.send(result);//goi kq cho react native
    })
})
app.post('/insertkh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idKH: null, TenKH: req.body.TenKH, DiaChi: req.body.DiaChi, SoDT: req.body.SoDT, GhiChu: req.body.GhiChu };
    var sql = 'INSERT INTO khachhang SET ?';

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("insert khách hàng table")
        res.send({
            status: 'du lieu da goi thanh cong',
            idKH: null,
            TenKH: req.body.TenKH,
            DiaChi: req.body.DiaChi,
            SoDT: req.body.SoDT,
            GhiChu: req.body.GhiChu
        })
    })
})
app.post('/updatekh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idKH: req.body.idKH, TenKH: req.body.TenKH, DiaChi: req.body.DiaChi, SoDT: req.body.SoDT, GhiChu: req.body.GhiChu };
    var sql = `UPDATE khachhang SET ? WHERE idKH=${req.body.idKH}`;

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("update khách hàng")
        res.send({
            status: 'du lieu da sua thanh cong',
            idKH: null,
            TenKH: req.body.TenKH,
            DiaChi: req.body.DiaChi,
            SoDT: req.body.SoDT,
            GhiChu: req.body.GhiChu
        })
    })
})
app.post('/deletekh', (req, res) => {
    console.log(req.body);
    // tham so truyen
    var data = { idKH: req.body.idKH };
    var sql = `DELETE FROM khachhang WHERE ?`;

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("delete khách hàng")
        res.send({
            status: 'du lieu da xóa thanh cong',
            idKH: req.body.idKH,
        })
    })
})
app.post('/insertChiTietDet', (req, res) => {
    console.log(req.body);
    //tham so truyen
    var data = { idMD: req.body.idMD, idCTDH: req.body.idCTDH, NgayDet: req.body.NgayDet, SL_Ngay: req.body.SL_Ngay, SL_TC: req.body.SL_TC, SL_Dem: req.body.SL_Dem };
    var sql = 'INSERT INTO chitietdet SET ?';

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("insert chitietdet table")
        res.send({
            status: 'du lieu da goi thanh cong',
            idMD: req.body.idMD,
            idCTDH: req.body.idCTDH,
            NgayDet: req.body.NgayDet,
            SL_Ngay: req.body.SL_Ngay,
            SL_TC: req.body.SL_TC,
            SL_Dem: req.body.SL_Dem
        })
    })
})
app.post('/updateChiTietDet', (req, res) => {
    console.log(req.body);
    //tham so truyen
    var data = { idMD: req.body.idMD, idCTDH: req.body.idCTDH, NgayDet: req.body.NgayDet, SL_Ngay: req.body.SL_Ngay, SL_TC: req.body.SL_TC, SL_Dem: req.body.SL_Dem };
    var sql = `UPDATE chitietdet SET ? WHERE idMD=${req.body.idMD}`
        + ` and idCTDH=${req.body.idCTDH}`
        + ` and NgayDet='${req.body.NgayDet}`
        + "' ";

    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log("update chitietdet table");
        console.log(sql);
        res.send({
            status: 'du lieu da goi thanh cong',
            idMD: req.body.idMD,
            idCTDH: req.body.idCTDH,
            NgayDet: req.body.NgayDet,
            SL_Ngay: req.body.SL_Ngay,
            SL_TC: req.body.SL_TC,
            SL_Dem: req.body.SL_Dem,
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

// app.listen(3000, ('192.168.1.39'), () => {
//     console.log("Server đang chạy tại PORT 3000")
// })
