var express = require("express");
var router = express.Router();
const db = require("../utils/mysqlUtils");

router.post("/", function (req, res, _next) {
  const {
    user_id,
    reply_comment_id,
    reply_user_id,
    content,
    createTime = new Date(),
  } = req.body.params;

  const sql = `INSERT INTO reply 
  (user_id, reply_comment_id, reply_user_id, content, createTime)
   VALUES (?, ?, ?, ?, ?);`;

  db.query(
    sql,
    [user_id, reply_comment_id, reply_user_id, content, createTime],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
      } else {
        res.status(201).send("Reply created");
      }
    }
  );
});

module.exports = router;
