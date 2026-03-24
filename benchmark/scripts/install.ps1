# SPIN Evaluation Lab - install/bootstrap (Windows PowerShell)
# - installs node deps
# - bootstraps required folders + example artifact

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host "[1/4] Checking Node..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed. Install Node 18+ and retry."
  exit 1
}
$NodeVer = (node -v)
Write-Host "Node version: $NodeVer"

Write-Host "[2/4] Installing dependencies..."
npm install

Write-Host "[3/4] Bootstrapping folders + example artifact..."
node scripts/bootstrap_folders.mjs --force

Write-Host "[4/4] Done."
Write-Host "Next:"
Write-Host "  - Start UI: npm run dev"
Write-Host "  - Run a private benchmark: npm run bench -- --artifact private/_inbox/artifact.json --out private/runs"
Write-Host "  - Start auto-tweak: npm run tweak -- --minutes 10 --artifact private/_inbox/artifact.json"
Write-Host "  - Start runner: npm run runner"
