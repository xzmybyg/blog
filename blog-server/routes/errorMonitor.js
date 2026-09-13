const express = require('express')
const db = require('@utils/mysqlUtils')
const checkRole = require('@middleware/checkRole')

const router = express.Router()

router.use(checkRole)

router.get('/', async function (req, res, next) {
  const status = ['open', 'resolved', 'all'].includes(req.query.status) ? req.query.status : 'open'
  const where = status === 'all' ? '' : 'WHERE resolved = ?'
  const values = status === 'all' ? [] : [status === 'resolved' ? 1 : 0]

  try {
    const [[items], [summaryRows]] = await Promise.all([
      db.promise().query(
        `SELECT id, fingerprint, source, level, message, stack, route, method, status_code,
                request_id, user_agent, context_json, occurrences, first_seen_at, last_seen_at,
                resolved, resolved_at
         FROM error_event ${where}
         ORDER BY last_seen_at DESC
         LIMIT 200`,
        values,
      ),
      db.promise().query(
        `SELECT COUNT(*) AS total,
                SUM(resolved = 0) AS openCount,
                COALESCE(SUM(occurrences), 0) AS occurrences
         FROM error_event`,
      ),
    ])
    const summary = summaryRows[0] || {}
    res.set('Cache-Control', 'no-store')
    res.send({
      items,
      summary: {
        total: Number(summary.total || 0),
        openCount: Number(summary.openCount || 0),
        occurrences: Number(summary.occurrences || 0),
      },
    })
  } catch (error) {
    next(error)
  }
})

router.put('/:id/resolve', async function (req, res, next) {
  const id = Number(req.params.id)
  const resolved = req.body?.resolved
  if (!Number.isInteger(id) || id <= 0) return res.status(400).send({ message: '错误记录 ID 无效' })
  if (typeof resolved !== 'boolean') return res.status(400).send({ message: '错误处理状态无效' })

  try {
    const [result] = await db.promise().query(
      `UPDATE error_event
       SET resolved = ?, resolved_at = ${resolved ? 'CURRENT_TIMESTAMP' : 'NULL'}
       WHERE id = ?`,
      [resolved ? 1 : 0, id],
    )
    if (result.affectedRows === 0) return res.status(404).send({ message: '错误记录不存在' })
    res.send({ id, resolved })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async function (req, res, next) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).send({ message: '错误记录 ID 无效' })

  try {
    const [result] = await db.promise().query('DELETE FROM error_event WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).send({ message: '错误记录不存在' })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router
