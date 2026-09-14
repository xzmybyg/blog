const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const mysql = require('mysql2/promise')

const requiredVariables = ['TEST_DB_HOST', 'TEST_DB_PORT', 'TEST_DB_USER', 'TEST_DB_PASSWORD', 'TEST_DB_NAME']
const missingVariables = requiredVariables.filter((name) => !process.env[name])
const testDatabaseName = process.env.TEST_DB_NAME || ''

let skipReason = ''
if (missingVariables.length > 0) {
  skipReason = `未配置专用测试数据库：${missingVariables.join(', ')}`
} else if (!/(^|[_-])test([_-]|$)/i.test(testDatabaseName)) {
  skipReason = '安全检查未通过：TEST_DB_NAME 必须包含独立的 test 标识（例如 blog_test）'
} else if (process.env.DB_NAME && process.env.DB_NAME === testDatabaseName) {
  skipReason = '安全检查未通过：TEST_DB_NAME 不能与 DB_NAME 相同'
}

test('MySQL 专用测试库可执行迁移结构和唯一约束', { skip: skipReason || false }, async (t) => {
  const connection = await mysql.createConnection({
    host: process.env.TEST_DB_HOST,
    port: Number(process.env.TEST_DB_PORT),
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    database: testDatabaseName,
    charset: 'utf8mb4',
  })
  const temporaryTable = 'integration_rate_limit_config'

  t.after(async () => {
    await connection.query(`DROP TEMPORARY TABLE IF EXISTS \`${temporaryTable}\``)
    await connection.end()
  })

  const [databaseRows] = await connection.query('SELECT DATABASE() AS database_name, 1 AS result')
  assert.equal(databaseRows[0].database_name, testDatabaseName)
  assert.equal(databaseRows[0].result, 1)

  const migrationPath = path.resolve(__dirname, '..', 'migrations', '008_add_rate_limit_config.sql')
  const migrationSql = fs
    .readFileSync(migrationPath, 'utf8')
    .replace(
      'CREATE TABLE IF NOT EXISTS `rate_limit_config`',
      `CREATE TEMPORARY TABLE \`${temporaryTable}\``,
    )

  assert.ok(migrationSql.includes(`CREATE TEMPORARY TABLE \`${temporaryTable}\``))
  await connection.query(migrationSql)
  await connection.query(
    `INSERT INTO \`${temporaryTable}\` (rule_key, max_requests, window_ms) VALUES (?, ?, ?)`,
    ['login', 10, 600000],
  )

  const [rows] = await connection.query(
    `SELECT rule_key, max_requests, window_ms FROM \`${temporaryTable}\` WHERE rule_key = ?`,
    ['login'],
  )
  assert.deepEqual(rows[0], { rule_key: 'login', max_requests: 10, window_ms: 600000 })

  await assert.rejects(
    connection.query(
      `INSERT INTO \`${temporaryTable}\` (rule_key, max_requests, window_ms) VALUES (?, ?, ?)`,
      ['login', 20, 60000],
    ),
    (error) => error?.code === 'ER_DUP_ENTRY',
  )
})
