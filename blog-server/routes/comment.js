var express = require("express");
var router = express.Router();
const db = require("../utils/mysqlUtils");

function transformData(data) {
  return data.reduce((acc, cur) => {
    let commentIndex = acc.findIndex(comment => comment.comment_id === cur.id);
    if (commentIndex === -1) {
      acc.push({
        comment_id: cur.id,
        content: cur.content,
        like: cur.like,
        createTime: cur.createTime,
        user_id: cur.user_id,
        userName: cur.userName,
        avatar: cur.avatar,
        nickname: cur.user_nickName,
        replyList: [],
      });
      commentIndex = acc.length - 1;
    }
    if (!cur.reply_id) return acc;
    acc[commentIndex].replyList.push({
      reply_id: cur.reply_id,
      content: cur.reply_content,
      createTime: cur.reply_createTime,
      user_id: cur.reply_user_id,
      userName: cur.reply_userName,
      avatar: cur.reply_userAvatar,
      nickname: cur.reply_userNickName,
      reply_to_user_id: cur.reply_to_user_id,
      reply_to_userName: cur.reply_to_userName,
      reply_to_nickname: cur.reply_to_nickname,
    });
    return acc;
  }, []);
}

router.get("/", function (req, res, _next) {
  const { id } = req.query;

  // const sql = `SELECT c.*, u.id, u.userName,u.avatar FROM comment c LEFT JOIN user u ON u.id = c.user_id WHERE c.article_id = ?;`;
  const sql = `select 
  comment.id,comment.content,comment.like,comment.createTime,
  user.id user_id,user.userName,user.avatar,user.nickname user_nickName,
  reply.id reply_id,reply.content reply_content,reply.createTime reply_createTime,
  replyUser.id reply_user_id, replyUser.userName reply_userName, replyUser.avatar reply_userAvatar, replyUser.nickname reply_userNickName,
  replyTo.id reply_to_user_id, replyTo.userName reply_to_userName,replyTo.nickname reply_to_nickname,replyTo.avatar reply_to_userAvatar, replyTo.nickname reply_to_userNickName
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
  const { user_id, article_id, content, createTime = new Date() } = req.body.params;
  console.log(req.body);
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
            createTime
        }
      res.status(200).send(data);
    }
  });
  // res.send("ok");
});

module.exports = router;
