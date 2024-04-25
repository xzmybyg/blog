var express = require("express");
var router = express.Router();
const db = require("../utils/mysqlUtils");

router.get("/", function (req, res, _next) {
  const sql = `SELECT * FROM label`;

  db.query(sql, (err, data, _field) => {
    if (err) {
      console.error(err);
    } else {
      res.send(data);
    }
  });
});

router.post("/", function (req, res, _next) {
  // 从请求体中获取标签
  const {
    label, // 标签名
    color = "#108ee9", // 颜色，默认为#108ee9
    createTime = new Date(), // 创建日期，默认为当前日期
  } = req.body;

  const sql = `INSERT INTO label 
  (label, color, createTime) 
  VALUES (?, ?, ?)`;
  db.query(sql, [label, color, createTime], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      res.status(201).send("Label created");
    }
  });
});

router.delete("/", function (req, res, _next) {
  // 从查询参数中获取标签 ID
  const { id } = req.body;

  // 创建 SQL 查询
  const sql = `DELETE FROM label WHERE id = ?`;

  // 执行 SQL 查询
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Label not found");
    } else {
      res.status(200).send("Label deleted");
    }
  });
});

router.put("/", function (req, res, _next) {
  // 从请求体中获取标签 ID 和新的标签数据
  const { id, ...fields } = req.body;

  // 创建 SQL 查询的 SET 部分
  const setParts = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    setParts.push(`${key} = ?`);
    values.push(value);
  }

  // 如果没有接收到任何字段，返回错误
  if (setParts.length === 0) {
    return res.status(400).send("No fields to update");
  }

  // 创建 SQL 查询
  const sql = `UPDATE label 
  SET ${setParts.join(", ")} 
  WHERE id = ?`;

  // 添加标签 ID 到参数列表
  values.push(id);

  // 执行 SQL 查询
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Label not found");
    } else {
      res.status(200).send("Label updated");
    }
  });
});

module.exports = router;
