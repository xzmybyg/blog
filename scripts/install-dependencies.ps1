param(
    [Parameter(Mandatory = $true)]
    [string]$WorkspaceRoot,

    [Parameter(Mandatory = $true)]
    [string]$StateRoot
)

$ErrorActionPreference = 'Stop'

$dependencyFiles = @(
    Join-Path $WorkspaceRoot 'package.json'
    Join-Path $WorkspaceRoot 'pnpm-lock.yaml'
    Join-Path $WorkspaceRoot 'pnpm-workspace.yaml'
    Join-Path $WorkspaceRoot 'blog-web\package.json'
    Join-Path $WorkspaceRoot 'blog-server\package.json'
)

$fingerprintSource = foreach ($file in $dependencyFiles) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        throw "Dependency manifest not found: $file"
    }
    $relativePath = $file.Substring($WorkspaceRoot.TrimEnd('\\').Length).TrimStart('\\')
    "$relativePath=$((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash)"
}

$fingerprintBytes = [System.Text.Encoding]::UTF8.GetBytes(($fingerprintSource -join "`n"))
$sha256 = [System.Security.Cryptography.SHA256]::Create()
try {
    $fingerprint = -join ($sha256.ComputeHash($fingerprintBytes) | ForEach-Object { $_.ToString('x2') })
}
finally {
    $sha256.Dispose()
}
$stateFile = Join-Path $StateRoot 'dependency-fingerprint.txt'
$cachedFingerprint = if (Test-Path -LiteralPath $stateFile) {
    (Get-Content -LiteralPath $stateFile -Raw).Trim()
} else {
    ''
}

New-Item -ItemType Directory -Path $StateRoot -Force | Out-Null

if ($cachedFingerprint -eq $fingerprint) {
    Write-Host 'Dependency manifests are unchanged; installing from the pnpm store without network access.'
    & pnpm.cmd install --frozen-lockfile --offline
    if ($LASTEXITCODE -eq 0) {
        exit 0
    }
    Write-Warning 'The offline pnpm store is incomplete; falling back to a network-enabled install.'
}
else {
    Write-Host 'Dependency manifests changed; checking the pnpm store before downloading missing packages.'
}

& pnpm.cmd install --frozen-lockfile --prefer-offline
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Set-Content -LiteralPath $stateFile -Value $fingerprint -Encoding ascii
