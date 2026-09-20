let transporter

function getTransporter() {
  if (transporter) return transporter
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  if (!host || !user || !pass) throw new Error('SMTP is not configured')

  const nodemailer = require('nodemailer')
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user, pass },
  })
  return transporter
}

async function sendPasswordResetCode(email, code) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  await getTransporter().sendMail({
    from,
    to: email,
    subject: '博客账号密码重置验证码',
    text: `你的密码重置验证码是 ${code}，10 分钟内有效。若非本人操作，请忽略此邮件。`,
    html: `<p>你的密码重置验证码是：</p><p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p><p>验证码 10 分钟内有效。若非本人操作，请忽略此邮件。</p>`,
  })
}

module.exports = { sendPasswordResetCode }
