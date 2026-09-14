param(
  [Parameter(Mandatory = $true)]
  [string]$WorkspaceRoot,
  [Parameter(Mandatory = $true)]
  [string]$DeployRoot,
  [Parameter(Mandatory = $true)]
  [string]$ReleaseSha,
  [string]$Pm2Command = 'pm2.cmd',
  [string]$PnpmCommand = 'pnpm.cmd',
  [string]$AppName = 'blog',
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-Robocopy {
  param([string[]]$Arguments)
  & robocopy.exe @Arguments
  if ($LASTEXITCODE -ge 8) {
    throw "Robocopy failed with exit code $LASTEXITCODE"
  }
}

function Get-Pm2Pid {
  $output = (& $Pm2Command pid $AppName 2>$null | Out-String).Trim()
  $pidValue = 0
  if ([int]::TryParse($output, [ref]$pidValue)) { return $pidValue }
  return 0
}

function Get-PortPids {
  return @(
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
  )
}

$workspace = (Resolve-Path -LiteralPath $WorkspaceRoot).Path
$sourceServer = Join-Path $workspace 'blog-server'
$sourceFrontend = Join-Path $workspace 'blog-web\blog'
if (-not (Test-Path -LiteralPath (Join-Path $sourceServer 'app.js'))) {
  throw "Backend source not found: $sourceServer"
}
if (-not (Test-Path -LiteralPath (Join-Path $sourceFrontend 'index.html'))) {
  throw "Frontend build output not found: $sourceFrontend"
}

$deploy = [System.IO.Path]::GetFullPath($DeployRoot)
if ($workspace.TrimEnd('\') -eq $deploy.TrimEnd('\')) {
  throw 'WorkspaceRoot and DeployRoot must be different directories'
}

$targetServer = Join-Path $deploy 'blog-server'
$targetFrontend = Join-Path $targetServer 'public\blog'
$targetWeb = Join-Path $deploy 'blog-web'
New-Item -ItemType Directory -Force -Path $targetServer, $targetFrontend, $targetWeb | Out-Null

foreach ($protectedPath in @('config\sqlconfig.js')) {
  $fullProtectedPath = Join-Path $targetServer $protectedPath
  if (-not (Test-Path -LiteralPath $fullProtectedPath)) {
    throw "Required production configuration is missing: $fullProtectedPath"
  }
}

$pm2PidBefore = Get-Pm2Pid
$portPidsBefore = @(Get-PortPids)
if ($portPidsBefore.Count -gt 0 -and ($pm2PidBefore -eq 0 -or $portPidsBefore -notcontains $pm2PidBefore)) {
  throw "Port $Port is owned by PID(s) $($portPidsBefore -join ', '), but PM2 '$AppName' PID is $pm2PidBefore"
}

Invoke-Robocopy @(
  $sourceServer,
  $targetServer,
  '/E', '/R:2', '/W:2', '/NP', '/NFL', '/NDL',
  '/XD',
  (Join-Path $sourceServer 'node_modules'),
  (Join-Path $sourceServer 'coverage'),
  (Join-Path $sourceServer 'public\blog'),
  '/XF', '.env', '.env.*'
)

Invoke-Robocopy @(
  $sourceFrontend,
  $targetFrontend,
  '/MIR', '/R:2', '/W:2', '/NP', '/NFL', '/NDL'
)

Copy-Item -LiteralPath (Join-Path $workspace 'package.json') -Destination $deploy -Force
Copy-Item -LiteralPath (Join-Path $workspace 'pnpm-lock.yaml') -Destination $deploy -Force
Copy-Item -LiteralPath (Join-Path $workspace 'pnpm-workspace.yaml') -Destination $deploy -Force
Copy-Item -LiteralPath (Join-Path $workspace 'blog-web\package.json') -Destination $targetWeb -Force

Push-Location $deploy
try {
  & $PnpmCommand --filter blog-server install --prod --frozen-lockfile --ignore-scripts
  if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed with exit code $LASTEXITCODE" }

  $env:RELEASE_SHA = $ReleaseSha
  $env:PM2_APP_NAME = $AppName
  & $Pm2Command startOrReload (Join-Path $targetServer 'ecosystem.config.js') --env production --update-env
  if ($LASTEXITCODE -ne 0) { throw "PM2 restart failed with exit code $LASTEXITCODE" }
  & $Pm2Command save
  if ($LASTEXITCODE -ne 0) { throw "PM2 save failed with exit code $LASTEXITCODE" }
} finally {
  Pop-Location
}

$health = $null
for ($attempt = 1; $attempt -le 20; $attempt += 1) {
  try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 3
    if ($health.status -eq 'ok') { break }
  } catch {
    if ($attempt -eq 20) {
      & $Pm2Command logs $AppName --lines 50 --nostream
      throw
    }
  }
  Start-Sleep -Seconds 1
}

$pm2PidAfter = Get-Pm2Pid
$portPidsAfter = @(Get-PortPids)
if ($pm2PidAfter -eq 0 -or $portPidsAfter -notcontains $pm2PidAfter) {
  throw "Deployment PID mismatch: PM2 '$AppName' PID is $pm2PidAfter, port $Port PID(s) are $($portPidsAfter -join ', ')"
}
if ($health.release -ne $ReleaseSha) {
  throw "Deployment release mismatch: expected $ReleaseSha, received $($health.release)"
}

Write-Host "Deployment verified: release=$($health.release), pid=$pm2PidAfter, port=$Port"
