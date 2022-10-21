const controller = {};
controller.insert = (req, res) => {
    const data = req.body;//lay du lieu tu client
    console.log(data);
    req.getConnection((err, conn) => {
        const query = conn.query("INSERT INTO donhang SET name='"
            + data['name'] + "',address='" + data['address'] + "'",
            data, (err, customer) => {
                if (err) throw err,
                    console.log(customer)
            });
    });
}
controller.select = (req, res) => {
    req.getConnection((err, conn) => {
        const query = conn.query('SELECT * FROM donhang', (err, data, fields) => {
            if (err) {
                res.json(err);
            }
            return res.json(data);//tra ve ket qua
        })
    })

}
controller.update = (req, res) => {
    const newCus = req.body;
    req.getConnection((err, conn) => {
        conn.query = ("UPDATE donhang SET name='" + newCus['name']
            + "', address='" + newCus['address'] + "' WHERE id = '"
            + newCus['id'] + "'", [newCus], (err, rows) => {
                if (err) throw err;
                console.log(rows)
            })
    })
}
controller.delete = (req, res) => {
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query("DELETE FROM donhang WHERE id='"
            + data['id'], [data], (err, rows) => {
                if (err) throw err,
                    console.log(rows);
            })
    })
}
module.exports = controller;