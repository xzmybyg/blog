var express = require('express')
var tls = require('tls')
var http = require('http')
var https = require('https')
var router = express.Router()
const checkRole = require('@middleware/checkRole')

const CERTIFICATE_HOST = process.env.CERTIFICATE_MONITOR_HOST || 'www.xzmybyg.cn'
const CERTIFICATE_PORT = Number(process.env.CERTIFICATE_MONITOR_PORT || 443)
const JENKINS_URL = process.env.JENKINS_URL || 'http://cicd.xzmybyg.cn'
const JENKINS_CERTIFICATE_JOB = process.env.JENKINS_CERTIFICATE_JOB || 'certificate-auto-deploy'

function requestJenkins(pathname, method = 'GET', headers = {}) {
  const username = process.env.JENKINS_USER
  const apiToken = process.env.JENKINS_API_TOKEN

  if (!username || !apiToken) {
    return Promise.reject(new Error('Jenkins credentials are not configured'))
  }

  const target = new URL(pathname, JENKINS_URL)
  const transport = target.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    const request = transport.request(
      target,
      {
        method,
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${apiToken}`).toString('base64')}`,
          ...headers,
        },
      },
      (response) => {
        let body = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => { body += chunk })
        response.on('end', () => resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body,
        }))
      },
    )

    request.setTimeout(5000, () => request.destroy(new Error('Jenkins request timed out')))
    request.once('error', reject)
    request.end()
  })
}

router.get('/', checkRole, function (_req, res) {
  const socket = tls.connect(
    {
      host: CERTIFICATE_HOST,
      port: CERTIFICATE_PORT,
      servername: CERTIFICATE_HOST,
      rejectUnauthorized: true,
    },
    () => {
      const certificate = socket.getPeerCertificate()
      const validTo = new Date(certificate.valid_to)
      const remainingDays = Math.max(
        0,
        Math.ceil((validTo.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      )

      socket.end()
      res.send({
        domain: CERTIFICATE_HOST,
        validTo: validTo.toISOString(),
        remainingDays,
        issuer: certificate.issuer?.O || certificate.issuer?.CN || '',
      })
    },
  )

  socket.setTimeout(5000, () => {
    socket.destroy(new Error('Certificate lookup timed out'))
  })

  socket.once('error', (error) => {
    if (!res.headersSent) {
      console.error(`Failed to read certificate for ${CERTIFICATE_HOST}:`, error.message)
      res.status(502).send({ message: 'Unable to read deployed certificate' })
    }
  })
})

router.post('/update', checkRole, async function (_req, res) {
  try {
    const jobPath = `/job/${encodeURIComponent(JENKINS_CERTIFICATE_JOB)}`
    const jobResponse = await requestJenkins(`${jobPath}/api/json?tree=inQueue,color`)

    if (jobResponse.statusCode !== 200) {
      throw new Error(`Unable to read Jenkins job (${jobResponse.statusCode})`)
    }

    const job = JSON.parse(jobResponse.body)
    if (job.inQueue || String(job.color).endsWith('_anime')) {
      return res.status(409).send({ message: '证书更新任务已在执行，请勿重复提交' })
    }

    const crumbResponse = await requestJenkins('/crumbIssuer/api/json')
    const headers = {}
    if (crumbResponse.statusCode === 200) {
      const crumb = JSON.parse(crumbResponse.body)
      headers[crumb.crumbRequestField] = crumb.crumb
    }

    const buildResponse = await requestJenkins(
      `${jobPath}/buildWithParameters?FORCE_UPDATE=true`,
      'POST',
      headers,
    )

    if (![201, 302].includes(buildResponse.statusCode)) {
      throw new Error(`Jenkins rejected the build (${buildResponse.statusCode})`)
    }

    res.status(202).send({
      message: '强制更新任务已提交',
      queueUrl: buildResponse.headers.location || '',
    })
  } catch (error) {
    console.error('Failed to trigger certificate update:', error.message)
    const isMissingCredentials = error.message === 'Jenkins credentials are not configured'
    res.status(isMissingCredentials ? 503 : 502).send({
      message: isMissingCredentials
        ? '服务器尚未配置 Jenkins 访问凭据'
        : '证书更新任务提交失败，请检查 Jenkins 配置',
    })
  }
})

module.exports = router
