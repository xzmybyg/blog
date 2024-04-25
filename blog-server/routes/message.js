var express = require("express");
var router = express.Router();
const db = require("../utils/mysqlUtils");

router.get("/", function (req, res, _next) {
  const sql = `SELECT * FROM message`;
  db.query(sql, (err, data, _field) => {
    if (err) {
      console.error(err);
    } else {
      res.send(data);
    }
  });
});

router.post("/", function (req, res, _next) {
  const { id: user_id, content, createTime = new Date() } = req.body;
  const sql = `INSERT INTO message (user_id, content, createTime) VALUES (?, ?, ?)`;
  db.query(sql, [user_id, content, createTime], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
        const data = {
            id: result.insertId,
            user_id,
            content,
            createTime
        }
      res.status(200).send(data);
    }
  });
});

module.exports = router;
