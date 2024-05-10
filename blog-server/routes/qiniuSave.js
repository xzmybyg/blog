var express = require("express")
var router = express.Router()
const db = require("../utils/mysqlUtils")
const fs = require("fs")
const path = require("path")

var qiniu = require("qiniu")
var qiniuconfig = require("../config/qiniuconfig")
//需要填写你的 Access Key 和 Secret Key
const { accessKey, secretKey, scope, fromRegionId } = qiniuconfig

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
const options = {
  scope,
}
const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)
const config = new qiniu.conf.Config()
// 空间对应的区域，若不配置将自动查询
config.regionsProvider = qiniu.httpc.Region.fromRegionId(fromRegionId)
const formUploader = new qiniu.form_up.FormUploader(config)
const putExtra = new qiniu.form_up.PutExtra()

router.post("/", async function (req, res, _next) {
  const { fileName, content } = req.body
  const dir = "public/article"
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const filePath = path.join(__dirname, "../public/article/", `${fileName}.md`)
  const qiniuPath = `article/${fileName}.md`

  // 文件上传
  formUploader
    .putFile(uploadToken, qiniuPath, filePath, putExtra)
    .then(({ data, resp }) => {
      if (resp.statusCode === 200) {
        console.log(data)
        res.send("File uploaded!")
      } else {
        console.log(resp.statusCode)
        console.log(data)
        res.send("File upload failed!")
      }
    })
    .catch((err) => {
      console.log("failed", err)
      res.send("File upload failed!")
    })
})

module.exports = router
