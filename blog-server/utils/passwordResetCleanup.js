function getDatabase() {
  return require('./mysqlUtils')
}

async function cleanupPasswordResetTokens() {
  try {
    const [result] = await getDatabase().promise().query(
      `DELETE FROM password_reset_token
       WHERE expires_at < NOW()
          OR (consumed_at IS NOT NULL AND consumed_at < DATE_SUB(NOW(), INTERVAL 1 DAY))`,
    )
    return result.affectedRows
  } catch (error) {
    console.error(`过期密码重置记录清理失败：${error.message}`)
    return 0
  }
}

module.exports = { cleanupPasswordResetTokens }
