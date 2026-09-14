const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const lineThreshold = 70
const reportDirectory = path.resolve(process.cwd(), '..', 'reports')
const reportPath = path.join(reportDirectory, 'server-tests.xml')
fs.mkdirSync(reportDirectory, { recursive: true })

const result = spawnSync(process.execPath, [
  '--test',
  '--experimental-test-coverage',
  '--test-reporter=spec',
  '--test-reporter-destination=stdout',
  '--test-reporter=junit',
  `--test-reporter-destination=${reportPath}`,
], {
  cwd: process.cwd(),
  encoding: 'utf8',
})

if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)

if (result.error) {
  console.error(`Unable to run tests with coverage: ${result.error.message}`)
  process.exit(1)
}
if (result.status !== 0) process.exit(result.status || 1)

const output = `${result.stdout || ''}\n${result.stderr || ''}`
const lineCoverage = Number(output.match(/all files\s*\|\s*([\d.]+)/)?.[1])

if (!Number.isFinite(lineCoverage)) {
  console.error('Unable to read total line coverage from the Node.js test report.')
  process.exit(1)
}
if (lineCoverage < lineThreshold) {
  console.error(`Line coverage ${lineCoverage}% is below the required ${lineThreshold}%.`)
  process.exit(1)
}

console.log(`Line coverage ${lineCoverage}% meets the required ${lineThreshold}%.`)
