var express = require("express");
var router = express.Router();
const db = require("../utils/mysqlUtils");
const fs = require("fs");
const path = require("path");

router.get("/", function (req, res, next) {
  const { id } = req.query;
  const sql = `SELECT * FROM article WHERE ID=${id}`;
  
  if (id) {
    db.query(sql, (err, data, field) => {
      if (err) {
        console.error(err);
      } else {
        res.sendFile(`/article/${data[0].article}.md`, { root: "public" });
      }
    });
  }
});

router.post("/", function (req, res, _next) {
  const { fileName, content } = req.body;
  // console.log(content, fileName);
  const dir = "public/article";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(__dirname, "../public/article/", `${fileName}.md`);
  // console.log(filePath);
  fs.writeFile(filePath, content, err => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      res.send("File uploaded!");
    }
  });
});

module.exports = router;
