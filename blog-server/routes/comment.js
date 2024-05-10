var express = require("express");
var router = express.Router();
const db = require("../utils/mysqlUtils");

function transformData(data) {
  return data.reduce((acc, cur) => {
    let commentIndex = acc.findIndex(
      (comment) => comment.comment_id === cur.id
    );
    if (commentIndex === -1) {
      acc.push({
        comment_id: cur.id,
        content: cur.content,
        like: cur.like,
        createTime: cur.createTime,
        user_id: cur.user_id,
        username: cur.username,
        avatar: cur.avatar,
        nickname: cur.user_nickName,
        replyList: [],
        article_id: cur.article_id,
        comment_to_article_id: cur.comment_to_article_id,
        comment_to_article_title: cur.comment_to_article_title,
      });
      commentIndex = acc.length - 1;
    }
    if (!cur.reply_id) return acc;
    acc[commentIndex].replyList.push({
      reply_id: cur.reply_id,
      content: cur.reply_content,
      createTime: cur.reply_createTime,
      user_id: cur.reply_user_id,
      username: cur.reply_username,
      avatar: cur.reply_userAvatar,
      nickname: cur.reply_userNickName,
      reply_to_user_id: cur.reply_to_user_id,
      reply_to_username: cur.reply_to_username,
      reply_to_nickname: cur.reply_to_nickname,
    });
    return acc;
  }, []);
}

router.get("/", function (req, res, _next) {
  const { id } = req.query;

  // const sql = `SELECT c.*, u.id, u.username,u.avatar FROM comment c LEFT JOIN user u ON u.id = c.user_id WHERE c.article_id = ?;`;
  const sql = `select 
  comment.id,comment.content,comment.like,comment.createTime,
  user.id user_id,user.username,user.avatar,user.nickname user_nickName,
  reply.id reply_id,reply.content reply_content,reply.createTime reply_createTime,
  replyUser.id reply_user_id, replyUser.username reply_username, replyUser.avatar reply_userAvatar, replyUser.nickname reply_userNickName,
  replyTo.id reply_to_user_id, replyTo.username reply_to_username,replyTo.nickname reply_to_nickname,replyTo.avatar reply_to_userAvatar, replyTo.nickname reply_to_userNickName
  from comment 
  left join user on user.id = comment.user_id 
  left join reply on comment.id = reply.reply_comment_id 
  left join user replyUser on reply.user_id = replyUser.id
  left join user replyTo on reply.reply_user_id = replyTo.id
  where comment.article_id = ?;`;

  db.query(sql, [id], (err, data, _field) => {
    if (err) {
      console.error(err);
    } else {
      const dataList = transformData(data);
      res.send(dataList);
      // res.send(data);
    }
  });
});

router.post("/", function (req, res, _next) {
  const {
    user_id,
    article_id,
    content,
    createTime = new Date(),
  } = req.body.params;
  const sql = `INSERT INTO comment (user_id, article_id, content, createTime) VALUES (?, ?, ?, ?)`;
  db.query(sql, [user_id, article_id, content, createTime], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      const data = {
        id: result.insertId,
        user_id,
        article_id,
        content,
        createTime,
      };
      res.status(200).send(data);
    }
  });
  // res.send("ok");
});

router.put("/", function (req, res, _next) {
  const { id, like } = req.body.params;
  const sql = `UPDATE comment SET like = ? WHERE id = ?`;
  db.query(sql, [like, id], (err, _result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      res.status(200).send("ok");
    }
  });
});

router.delete("/", function (req, res, _next) {
  const { id } = req.query;
  const sql = `DELETE FROM comment WHERE id = ?`;
  db.query(sql, [id], (err, _result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      res.status(200).send("ok");
    }
  });
});

router.get("/commentList", function (req, res, _next) {
  const sql = `select 
  comment.id,comment.content,comment.like,comment.createTime,comment.article_id,
  user.id user_id,user.username,user.avatar,user.nickname user_nickName,
  reply.id reply_id,reply.content reply_content,reply.createTime reply_createTime,
  replyUser.id reply_user_id, replyUser.username reply_username, replyUser.avatar reply_userAvatar, replyUser.nickname reply_userNickName,
  replyTo.id reply_to_user_id, replyTo.username reply_to_username,replyTo.nickname reply_to_nickname,replyTo.avatar reply_to_userAvatar, replyTo.nickname reply_to_userNickName,
  comment_article.id comment_to_article_id, comment_article.title comment_to_article_title
  from comment 
  left join user on user.id = comment.user_id 
  left join reply on comment.id = reply.reply_comment_id 
  left join user replyUser on reply.user_id = replyUser.id
  left join user replyTo on reply.reply_user_id = replyTo.id
  left join article comment_article on article_id = comment_article.id;`;
  db.query(sql, (err, data, _field) => {
    if (err) {
      console.error(err);
    } else {
      const dataList = transformData(data);
      res.send(dataList);
    }
  });
});

module.exports = router;
